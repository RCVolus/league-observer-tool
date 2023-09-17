import { BrowserWindow } from "electron"

export class Sender {
  static currentWindow: BrowserWindow

  static emit(event: string, ...args: any[]): void {
    Sender.currentWindow.webContents.postMessage(event, args)
  }

  /**
   * Sets the progress bar on the current window
   * @param percent 0 to 100 for progress over 100 for pulsing
   */
  static setProgressBar(percent: number): void {
    Sender.currentWindow.setProgressBar(percent / 100)
  }
}