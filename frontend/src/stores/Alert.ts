import { writable, Writable } from 'svelte/store'
import type { DisplayError } from '../../../types/DisplayError';
const { ipcRenderer } = require('electron')

class Alert {
  public Alert : Writable<DisplayError | null> = writable(null)

  constructor () {
    ipcRenderer.on('error', (_e: any, error : DisplayError) => {
      this.Alert.set(error)
    })
  }
}
export const AlertStore = new Alert();