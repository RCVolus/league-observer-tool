import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld('sender', {
  on: (channel : string, func : (event : Electron.IpcRendererEvent, ...data : any[]) => void ) => {
    ipcRenderer.on(channel, func)
  }
})

contextBridge.exposeInMainWorld('connector', {
  server : {
    start : () => {
      ipcRenderer.invoke('lcu-connection-start')
    }
  },
  lcu : {
    start : () => {
      ipcRenderer.invoke('server-connection-start')
    }
  },
  stop : () => {
    ipcRenderer.invoke('connection-stop')
  }
})

contextBridge.exposeInMainWorld('modules', {
  getModules: () => {
    return ipcRenderer.invoke('modules-ready')
  },
  callAction : (moduleID : string, action : string) => {
    ipcRenderer.invoke(`${moduleID}-${action}`)
  },
  saveData : (moduleID : string) => {
    ipcRenderer.invoke(`${moduleID}-save`)
  },
  start : (moduleID : string) => {
    ipcRenderer.invoke(`${moduleID}-start`)
  },
  stop : (moduleID : string) => {
    ipcRenderer.invoke(`${moduleID}-stop`)
  }
})