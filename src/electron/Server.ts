import WebSocket from "ws";
import { ipcMain } from 'electron';
import { Sender } from './Sender';
import { trim } from './trim';
import { DisplayError } from '../../types/DisplayError';
import settings from 'electron-app-settings';
import { ServerRequest } from "../../types/ServerRequest";

export class Server {
  private ws ? : WebSocket
  private timeout ? : ReturnType<typeof setTimeout>
  private serverIP : string
  private isClosing : boolean = false
  private InitConnection : boolean = true
  private subscriptions: Map<string, ((req : ServerRequest) => void)[]> = new Map()

  static msg = {
    "meta": {
      "namespace": "lpte",
      "type": "subscribe"
    },
    "to": {
      "namespace": "lcu",
      "type": "http-request"
    }
  }

  constructor () {
    this.serverIP = settings.get("server-ip") || "10.244.69.129"
    settings.set("server-ip", this.serverIP)

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
  public connect () {
    const wsURI = `ws://${this.serverIP}:3003/eventbus`
    this.ws = new WebSocket(wsURI)

    this.ws.onopen = () => {
      this.isClosing = false
      this.InitConnection = false
      this.ws?.send(Server.msg)
      Sender.send('server-connection', true)
    }

    this.ws.onmessage = (content) => {
      const json = JSON.parse(content.data.toString()) as ServerRequest

      if (json.meta.namespace != "lcu") return
      
      if (this.subscriptions.has(json.meta.type)) {
        this.subscriptions.get(json.meta.type)?.forEach((cb) => {
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

  public subscribe(path: string, effect: (req: ServerRequest) => void) {
    const p = `${trim(path)}`

    if (!this.subscriptions.has(p)) {
      this.subscriptions.set(p, [effect])
    } else {
      this.subscriptions.get(p)?.push(effect)
    }
  }

  public unsubscribe(path: string) {
    const p = `${trim(path)}`

    this.subscriptions.delete(p)
  }

  /**
   * disconnect
  */
  public disconnect() {
    this.isClosing = true
    this.InitConnection = true
    this.ws?.close()
    if (this.timeout) {
      clearTimeout(this.timeout)
    }
    Sender.send('server-connection', false)
  }

  /**
   * send
  */
  public send<T = any>(data : T) {
    this.ws?.send(data, (err) => {
      if (err) throw err
    })
  }
}