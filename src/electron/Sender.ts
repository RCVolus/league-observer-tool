import { BrowserWindow, dialog, MessageBoxOptions } from 'electron';

export class Sender {
  static mainWindow? : BrowserWindow

   /**
   * sendMsg
   */
  static send <T = any>(channel : string, data : T) {
    this.mainWindow?.webContents.send(channel, data)
  }

  static showMessageBoxSync (options : MessageBoxOptions) {
    if (!this.mainWindow) return
    return dialog.showMessageBoxSync(this.mainWindow, options)
  }
}