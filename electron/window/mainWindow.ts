import { app, BrowserWindow, dialog, globalShortcut } from "electron";
import { join } from 'path'
import { store } from '../index'

export default function createMainWindow () : BrowserWindow {
  let preloaderPath : string
  let allowDevTools : boolean
  if (app.isPackaged) {
    allowDevTools = false
    preloaderPath = join(app.getAppPath(), 'build', 'preload.js')
  } else {
    allowDevTools = true
    preloaderPath = join(app.getAppPath(), 'preload.js')
  }

  const options = Object.assign({
    height: 900,
    width: 400,
    title: "League Observer Tool",
    show: false,
    webPreferences: {
      webSecurity: true,
      nodeIntegration: false, // is default value after Electron v5
      contextIsolation: true, // protect against prototype pollution
      preload: preloaderPath,
      devTools: allowDevTools
    },
  }, store.get('window-bounds'))

  const mainWindow = new BrowserWindow(options)

  mainWindow.on("close", (e) => {
    const choice = dialog.showMessageBoxSync({
      type: "question",
      buttons: ["Yes", "No"],
      title: "Confirm",
      message: "Are you sure you want to quit?"
    })

    if (choice === 1) {
      e.preventDefault()
      return
    } else {
      store.set('window-bounds', mainWindow.getBounds())
      globalShortcut.unregisterAll()
    }
  })

  return mainWindow
}