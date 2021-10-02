import WebSocket from "ws";
import { ipcMain } from 'electron';
import { Sender } from '../helper/Sender';
import { DisplayError } from '../../types/DisplayError';
import Store from 'electron-store';
import type { LPTEvent } from '../../types/LPTE'
import uniqid from 'uniqid'

enum EventType {
  BROADCAST = 'BROADCAST',
  REQUEST = 'REQUEST',
  REPLY = 'REPLY'
}

export class Server {
  private ws ? : WebSocket
  private timeout ? : NodeJS.Timeout
  private prodClockInterval ? : NodeJS.Timeout
  public prodTimeOffset = 0
  private serverIP : string
  private isClosing = false
  private InitConnection = true
  private subscriptions: Map<string, ((data : LPTEvent) => void)[]> = new Map()

  constructor (
    private store : Store,
  ) {
    this.serverIP = this.store.get("server-ip", "10.244.69.129") as string
    this.store.set("server-ip", this.serverIP)

    ipcMain.on('server-connection-start', () => {
      this.connect()
    })
    ipcMain.on('server-connection-stop', () => {
      this.disconnect()
    })
  }
  
  /**
   * connect
  */
  public connect () : void {
    const wsURI = `ws://${this.serverIP}:3003/eventbus`
    this.ws = new WebSocket(wsURI)

    this.ws.onopen = () => {
      this.isClosing = false
      this.InitConnection = false
      this.syncProdClock()
      Sender.send('server-connection', true)
    }

    this.ws.onmessage = (content) => {
      const json = JSON.parse(content.data.toString()) as LPTEvent
      
      if (this.subscriptions.has(`${json.meta.namespace}-${json.meta.type}`)) {
        this.subscriptions.get(`${json.meta.namespace}-${json.meta.type}`)?.forEach((cb) => {
          cb(json)
        })
      }
    }

    this.ws.onerror = e => {
      Sender.send('error', {
        color: "danger",
        text: e.message
      } as DisplayError)
      Sender.send('server-connection', false)
    }

    this.ws.onclose = () => {
      Sender.send('server-connection', false)
      if (!this.isClosing && !this.InitConnection) {
        this.timeout = setTimeout(() => {this.connect()}, 5000)
      }
    }
  }

  public subscribe(namespace: string, type: string, effect: (data: LPTEvent) => void) : void {

    if (!this.subscriptions.has(`${namespace}-${type}`)) {
      const msg : LPTEvent = {
        meta: {
          namespace: "lpte",
          type: "subscribe"
        },
        to: {
          namespace: namespace,
          type: type
        }
      }
      this.send(msg)
      this.subscriptions.set(`${namespace}-${type}`, [effect])
    } else {
      this.subscriptions.get(`${namespace}-${type}`)?.push(effect)
    }
  }

  public subscribeOnce (namespace: string, type: string, effect: (data: LPTEvent) => void) : void {

    const onceWrapper = (data: LPTEvent) => {
      this.unsubscribe(namespace, type)
      effect(data)
    }

    if (!this.subscriptions.has(`${namespace}-${type}`)) {
      const msg : LPTEvent = {
        meta: {
          namespace: "lpte",
          type: "subscribe"
        },
        to: {
          namespace: namespace,
          type: type
        }
      }
      this.send(msg)
      this.subscriptions.set(`${namespace}-${type}`, [onceWrapper])
    } else {
      this.subscriptions.get(`${namespace}-${type}`)?.push(onceWrapper)
    }
  }

  public unsubscribe(namespace: string, type: string) : void {
    this.subscriptions.delete(`${namespace}-${type}`)
  }

  /**
   * disconnect
  */
  public disconnect() : void {
    this.isClosing = true
    this.InitConnection = true
    this.ws?.close()
    if (this.timeout) {
      clearTimeout(this.timeout)
    }
    if (this.prodClockInterval) {
      clearInterval(this.prodClockInterval)
    }
    Sender.send('server-connection', false)
  }

  /**
   * send
  */
  public send(data : LPTEvent) : void {
    this.ws?.send(JSON.stringify(data), (err) => {
      if (err) throw err
    })
  }

  public async request (event: LPTEvent, timeout = 5000) : Promise<LPTEvent> {
    const reply = `${event.meta.type}-${uniqid()}`
    event.meta.reply = reply
    event.meta.channelType = EventType.REQUEST

    setTimeout(() => {
      this.send(event)
    }, 0)

    try {
      return await this.await('reply', reply, timeout)
    } catch {
      throw new Error('request timed out')
    }
  }

  public async await (namespace: string, type: string, timeout = 5000): Promise<LPTEvent> {
    return await new Promise((resolve, reject) => {
      let wasHandled = false

      const handler = (e: LPTEvent): void => {
        if (wasHandled) {
          return
        }
        wasHandled = true
        this.unsubscribe(namespace, type)

        resolve(e)
      }
      // Register handler
      this.subscribe(namespace, type, handler)

      setTimeout(() => {
        if (wasHandled) {
          return
        }
        wasHandled = true
        this.unsubscribe(namespace, type)
        reject(new Error('request timed out'))
      }, timeout)
    })
  }

  public async getLocalTimeOffset () : Promise<number> {
    // Get before time to measure roundtrip time to server
    const beforeTime = new Date().getTime();

    // Send request
    const response = await this.request({
      meta: {
        namespace: 'prod-clock',
        type: 'request-sync',
        version: 1
      }
    });

    const afterTime = new Date().getTime();
    const serverTime = response.time as number;

    // Calculate roundtrip time (ping)
    const ping = afterTime - beforeTime;

    // We assume that the packet had the same time to travel client -> server, as it travels server -> client. Thus we have to remove half of the ping time from the server time to justify it correctly

    const justifiedServerTime = serverTime - (ping / 2);

    // Now we can use the justified server time to calculate the offset to the local clock.
    // This localOffset variable should be saved for a longer time
    const localOffset = justifiedServerTime - new Date().getTime();

    // Now whenever you need to get the current server time, do the following:
    // const currentServerTime = new Date(new Date().getTime() + localOffset);

    return localOffset;
  }

  private async syncProdClock () {
    const offset = await this.getLocalTimeOffset()
    this.prodTimeOffset = offset
    Sender.send('server-prod-clock', offset)

    this.prodClockInterval = setInterval(async () => {
      const offset = await this.getLocalTimeOffset()
      this.prodTimeOffset = offset
      Sender.send('server-prod-clock', offset)
    }, 1000 * 60)
  }
}