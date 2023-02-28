/// <reference types="svelte" />

export interface Constants {
  getVersion: () => Promise<string>
}

export interface Sender {
  on : (channel : string, func : (event : Electron.IpcRendererEvent, ...data : any[]) => void ) => void;
}

declare global {
  interface Window { 
    connector : Connector
    constants: Constants
    sender : Sender
  }
}