/// <reference types="svelte" />

import { ipcRenderer } from 'electron'

declare global {
  interface Window { ipcRenderer: Electron.IpcRenderer; }
}