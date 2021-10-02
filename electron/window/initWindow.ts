import { BrowserWindow } from "electron";
import * as path from "path";

export default function createInitWindow () : BrowserWindow {
  const initWindow = new BrowserWindow({
    height: 550,
    width: 350,
    title: "League Observer Tool",
    show: false,
    frame: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    }
  });
  initWindow.loadFile(path.join(__dirname, "../..", 'preload/public/index.html'))

  return initWindow
}