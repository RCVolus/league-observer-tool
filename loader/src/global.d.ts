/// <reference types="svelte" />

export interface Constants {
  version: string
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