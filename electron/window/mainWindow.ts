import { app, BrowserWindow } from "electron";
import * as path from 'path'
import cfg from 'electron-cfg';

export default function createMainWindow () : BrowserWindow {
  const winCfg = cfg.create(
    path.join(app.getPath('userData'),
    'window.json'
  ))
  const winOptions = winCfg.window();

  let preloaderPath : string
  let allowDevTools : boolean
  if (app.isPackaged) {
    allowDevTools = false
    preloaderPath = path.join(app.getAppPath(), 'build', 'preload.js')
  } else {
    allowDevTools = true
    preloaderPath = path.join(app.getAppPath(), 'preload.js')
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

  mainWindow.on('minimize', (event: any) => {
    event.preventDefault();
    mainWindow.hide();
  });

  return mainWindow
}