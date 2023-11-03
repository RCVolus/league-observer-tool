import { writable, type Writable } from 'svelte/store'
import type { DisplayError } from '../../../types/DisplayError';

class Alert {
  public Alert : Writable<DisplayError | null> = writable(null)

  constructor () {
    window.sender.on('error', (_e: any, error : DisplayError[]) => {
      this.Alert.set(error[0])
    })
  }
}
export const AlertStore = new Alert();