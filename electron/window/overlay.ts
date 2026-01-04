import { BrowserWindow } from "electron";
import { store } from '../index'

export default function createOverlayWindow(): BrowserWindow {
  const url = `http://${store.get('server-ip')}:${store.get('server-port')}/pages/op-module-league-in-game/gfx/ingame.html?apikey=${store.get('server-api-key')}`

  const overlayWindow = new BrowserWindow({
    width: 500,
    height: 500,
    title: "League Observer Tool - In-Game Overlay",
    show: true,
    transparent: true,
    resizable: true,
    maximizable: true,
    frame: false,
    alwaysOnTop: true,
    fullscreen: true,
    titleBarStyle: 'hidden',
    webPreferences: {
      webSecurity: true,
      nodeIntegration: false, // is default value after Electron v5
      contextIsolation: true, // protect against prototype pollution
    }
  });

  overlayWindow.setIgnoreMouseEvents(true);
  overlayWindow.setFocusable(false);

  overlayWindow.loadURL(url)
  overlayWindow.webContents.insertCSS(`html { width: 1920px; height: 1080px; transform: scale(0.8) translateX(-241px); transform-origin: top center; overflow: hidden; }`)

  /* overlayWindow.webContents.openDevTools({
    mode: 'detach'
  }) */

  return overlayWindow
}