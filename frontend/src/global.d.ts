/// <reference types="svelte" />

export interface Connector {
  server : {
    start : () => void
  }
  lcu : {
    start : () => void
  }
  stop : () => void
}

export interface Modules {
  getModules : () => Promise<Array<Module>>
  callAction : (moduleID : string, action : string) => void
  saveData : (moduleID : string) => void
  start : (moduleID : string) => void
  stop : (moduleID : string) => void
}

export interface Sender {
  on : (channel : string, func : (event : Electron.IpcRendererEvent, ...data : any[]) => void ) => void;
}

declare global {
  interface Window { 
    connector : Connector
    sender : Sender
    modules : Modules
  }
}