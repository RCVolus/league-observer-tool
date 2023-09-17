import { contextBridge, ipcRenderer } from "electron";
import Config from "../types/Config";

contextBridge.exposeInMainWorld('sender', {
  on: (channel: string, func: (event: Electron.IpcRendererEvent, ...data: any[]) => void) => {
    ipcRenderer.on(channel, func)
  }
})

contextBridge.exposeInMainWorld('store', {
  getStore: () => {
    return ipcRenderer.invoke('getStore')
  },
  saveStore: (store: Config) => {
    return ipcRenderer.invoke('saveStore', store)
  }
})

contextBridge.exposeInMainWorld('autoUpdater', {
  installUpdate: () => {
    return ipcRenderer.invoke('install-update')
  },
  skipUpdate: () => {
    return ipcRenderer.invoke('skip-update')
  }
})

contextBridge.exposeInMainWorld('config', {
  setupConfig: () => {
    return ipcRenderer.invoke('config-auto-setup')
  }
})

contextBridge.exposeInMainWorld("constants", {
  getVersion: (): Promise<string> => ipcRenderer.invoke('getVersion'),
  platform: process.platform
})

contextBridge.exposeInMainWorld('connector', {
  server: {
    start: () => {
      ipcRenderer.invoke('server-connection-start')
    }
  },
  lcu: {
    start: () => {
      ipcRenderer.invoke('lcu-connection-start')
    }
  },
  stop: () => {
    ipcRenderer.invoke('connection-stop')
  }
})

contextBridge.exposeInMainWorld('modules', {
  getModules: () => {
    return ipcRenderer.invoke('modules-ready')
  },
  callAction: (moduleID: string, action: string, value?: string | number) => {
    ipcRenderer.invoke(`${moduleID}-${action}`, value)
  },
  saveData: (moduleID: string) => {
    ipcRenderer.invoke(`${moduleID}-save`)
  },
  start: (moduleID: string) => {
    ipcRenderer.invoke(`${moduleID}-start`)
  },
  stop: (moduleID: string) => {
    ipcRenderer.invoke(`${moduleID}-stop`)
  }
})