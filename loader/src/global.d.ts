/// <reference types="svelte" />

export interface Constants {
  getVersion: () => Promise<string>
}

export interface AutoUpdater {
  installUpdate: () => Promise<void>
  skipUpdate: () => Promise<void>
}

export interface Sender {
  on : (channel : string, func : (event : Electron.IpcRendererEvent, ...data : any[]) => void ) => void;
}

declare global {
  interface Window {
    constants: Constants
    autoUpdater: AutoUpdater
    sender: Sender
  }
}