import { app, BrowserWindow, dialog, globalShortcut } from "electron";
import { join } from 'path'
import cfg from 'electron-cfg';

export default function createMainWindow () : BrowserWindow {
  const winCfg = cfg.create(
    join(app.getPath('userData'),
    'window.json'
  ))
  const winOptions = winCfg.window();

  let preloaderPath : string
  let allowDevTools : boolean
  if (app.isPackaged) {
    allowDevTools = false
    preloaderPath = join(app.getAppPath(), 'build', 'preload.js')
  } else {
    allowDevTools = true
    preloaderPath = join(app.getAppPath(), 'preload.js')
  }

  const mainWindow = new BrowserWindow({
    height: 900,
    width: 400,
    ...winOptions.options(),
    title: "League Observer Tool",
    show: false,
    webPreferences: {
      webSecurity: true,
      nodeIntegration: false, // is default value after Electron v5
      contextIsolation: true, // protect against prototype pollution
      preload: preloaderPath,
      devTools: allowDevTools
    }
  })

  winOptions.assign(mainWindow);

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
      globalShortcut.unregisterAll()
    }
  })

  return mainWindow
}