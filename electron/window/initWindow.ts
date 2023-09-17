import { app, BrowserWindow } from "electron";
import { join } from "path";

export default function createInitWindow(): BrowserWindow {
  let preloaderPath: string
  if (app.isPackaged) {
    preloaderPath = join(app.getAppPath(), 'build', 'preload.js')
  } else {
    preloaderPath = join(app.getAppPath(), 'preload.js')
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

  initWindow.loadFile(join(__dirname, "../..", 'loader/public/index.html'))

  return initWindow
}