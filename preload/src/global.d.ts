/// <reference types="svelte" />

export interface Connector {
  getConnectState : () => Promise<boolean>
}

export interface Sender {
  on : (channel : string, func : (event : Electron.IpcRendererEvent, ...data : any[]) => void ) => void;
}

declare global {
  interface Window { 
    connector : Connector
    sender : Sender
  }
}