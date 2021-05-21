import WebSocket from "ws";
import { ipcMain } from 'electron';
import { Sender } from './Sender';
import { DisplayError } from '../../types/DisplayError';

export class Server {
  private ws ? : WebSocket
  private timeout ? : ReturnType<typeof setTimeout>

  constructor () {
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
    this.ws = new WebSocket("ws://10.244.69.129:3003/eventbus")
    this.ws.onopen = () => Sender.send('server-connection', true)
    this.ws.onerror = e => {
      Sender.send('error', {
        color: "danger",
        text: e.message
      } as DisplayError)
      Sender.send('server-connection', false)
    }
    this.ws.onclose = () => {
      Sender.send('server-connection', false)
      this.timeout = setTimeout(() => {this.connect()}, 5000)
    }
  }

  /**
   * disconnect
  */
  public disconnect() {
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