/// <reference types="svelte" />

import type { Config } from "../../types/Config"

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
  callAction : (moduleID : string, action : string, value?: string | number) => void
  saveData : (moduleID : string) => void
  start : (moduleID : string) => void
  stop : (moduleID : string) => void
}

export interface Sender {
  on : (channel : string, func : (event : Electron.IpcRendererEvent, ...data : any[]) => void ) => void;
}

export interface Store {
  getStore : () => Promise<Config>;
  saveStore : (store: Config) => Promise<Config>;
}

export interface Config {
  setupConfig : () => Promise<void>;
}

declare global {
  interface Window { 
    connector : Connector
    sender : Sender
    modules : Modules
    store : Store
    config : Config
  }
}