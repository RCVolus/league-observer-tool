const { ipcRenderer } = window.require("electron");
import { writable, Writable } from "svelte/store";

class ServerConnection {
  public isConnected : Writable<boolean> = writable(false)

  constructor () {
    this.listenForConnection()
  }

  private listenForConnection () {
    ipcRenderer.on('server-connection', (_e: any, isConnected : boolean) => {
      this.isConnected.set(isConnected)
    })
  }

  public connect () {
    ipcRenderer.send('server-connection-start')
  }

  public disconnect () { 
    ipcRenderer.send('server-connection-stop')
  }
}
export const Server = new ServerConnection();