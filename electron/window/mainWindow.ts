import { BrowserWindow } from "electron";

export default function createMainWindow () : BrowserWindow {
  const mainWindow = new BrowserWindow({
    height: 900,
    width: 400,
    title: "League Observer Tool",
    show: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  mainWindow.on('minimize', (event: any) => {
    event.preventDefault();
    mainWindow.hide();
  });

  return mainWindow
}