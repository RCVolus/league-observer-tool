import { app, BrowserWindow } from "electron";
import * as path from "path";

export default function createInitWindow () : BrowserWindow {
  let preloaderPath : string
  if (app.isPackaged) {
    preloaderPath = path.join(app.getAppPath(), 'build', 'preload.js')
  } else {
    preloaderPath = path.join(app.getAppPath(), 'preload.js')
  }

  const initWindow = new BrowserWindow({
    height: 550,
    width: 350,
    title: "League Observer Tool",
    show: false,
    frame: false,
    webPreferences: {
      webSecurity: true,
      nodeIntegration: false, // is default value after Electron v5
      contextIsolation: true, // protect against prototype pollution
      preload: preloaderPath,
    }
  });

  initWindow.loadFile(path.join(__dirname, "../..", 'preload/public/index.html'))

  return initWindow
}