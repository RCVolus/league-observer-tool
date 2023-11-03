import { app, BrowserWindow, dialog, globalShortcut, ipcMain, Tray } from "electron";
import { createJumpLists } from "./jumpList";
import { Sender } from "./helper/Sender";
import { join } from "path";
import { LCU } from "./connector/LCU";
import { Server } from "./connector/Server";
import { MainMenu } from "./Menu";
import { Modules } from "./module/Modules";
import { autoUpdater } from "electron-updater"
import createMainWindow from "./window/mainWindow";
import createTray from "./tray";
import createInitWindow from "./window/initWindow";
import log from 'electron-log';
import api from "./api";
import Config from "../types/Config";
import Store from 'electron-store'
import createStore from "./store";
import { LiveEventsConfig } from "./setup/LiveEventsConfig";
import { GameConfig } from "./setup/GameConfig";

app.setAppUserModelId('gg.rcv.league-observer-tool')

autoUpdater.logger = log.scope('updater');
autoUpdater.autoDownload = false

let mainWindow: BrowserWindow
let initWindow: BrowserWindow
let tray: Tray
let gameConfig: GameConfig
let liveEventConfig: LiveEventsConfig
let lcu: LCU
let server: Server
export let store: Store<Config>

if (process.platform == "win32") {
  createJumpLists();
}
const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', (_event, commandLine) => {
    if (commandLine.includes('--quit-app')) {
      app.quit()
      return;
    }

    if (mainWindow.isMinimized()) {
      mainWindow.restore()
    } else if (!mainWindow.isVisible()) {
      mainWindow.show()
    }
    mainWindow.focus()
  })

  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  app.on("ready", () => {
    store = createStore()
    tray = createTray(mainWindow)

    ipcMain.handle('getVersion', () => {
      return app.getVersion()
    })

    mainWindow = createMainWindow()
    initWindow = createInitWindow()

    initApp();

    app.on("activate", function () {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (BrowserWindow.getAllWindows().length === 0) {
        mainWindow = createMainWindow()
        openMainWindow()
      }
    });
  });
}

async function initApp() {
  Sender.currentWindow = initWindow

  autoUpdater.on('checking-for-update', () => {
    Sender.emit('state', 'checking-app')
  })
  autoUpdater.on('update-available', (info) => {
    Sender.emit('show-patch-notes', JSON.stringify(info))
  })
  autoUpdater.on('download-progress', (progressInfo) => {
    Sender.emit('download-progress', progressInfo)
    Sender.setProgressBar(progressInfo.percent)
  })
  autoUpdater.on('update-not-available', () => {
    Sender.emit('state', 'finished')
    openMainWindow()
  })
  autoUpdater.on('error', () => {
    Sender.emit('state', 'error-app')
    setTimeout(openMainWindow, 1500)
  })
  autoUpdater.on('update-downloaded', () => {
    Sender.emit('state', 'update-downloaded-app')
    autoUpdater.quitAndInstall()
  })

  ipcMain.handle('install-update', () => {
    Sender.emit('state', 'downloading-app')
    autoUpdater.downloadUpdate()
  })
  ipcMain.handle('skip-update', () => {
    openMainWindow()
  })

  initWindow.webContents.on('did-finish-load', () => {
    initWindow.show()

    try {
      if (app.isPackaged) {
        autoUpdater.checkForUpdates()
      } else {
        openMainWindow()
      }
    } catch (e) {
      log.error(e)
    }
  })
}

function openMainWindow() {
  Sender.currentWindow = mainWindow

  // and load the index.html of the app.
  mainWindow.loadFile(join(__dirname, '../frontend/public/index.html'));

  lcu = new LCU()
  server = new Server()
  const menu = new MainMenu(lcu, server)
  const modules = new Modules(lcu, server, menu.mainMenu)

  api.listen(8572, () => {
    console.log('api is running on port 8572')
  })

  ipcMain.handle('connection-stop', () => {
    const options: Electron.MessageBoxSyncOptions = {
      buttons: ["Yes", "Cancel"],
      type: "question",
      message: "Do you really want to disconnect?"
    }
    const choice = dialog.showMessageBoxSync(options)
    if (choice == 1) return

    lcu.disconnect()
    server.disconnect()
  })

  mainWindow.on("close", async (e) => {
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
      await modules.disconnect()
      globalShortcut.unregisterAll()
      return
    }
  })

  mainWindow.webContents.on('did-finish-load', async () => {
    initWindow.close()
    mainWindow.show()
    await config()
  })
}

async function config() {
  if (!store.has('league-install-path') || store.get('league-install-path') === undefined || store.get('league-install-path') === '') {
    lcu.onConnected(() => {
      setTimeout(async () => {
        gameConfig = new GameConfig()
        liveEventConfig = new LiveEventsConfig()
        await checkConfigs()
      }, 2500)
    })
  } else {
    gameConfig = new GameConfig()
    liveEventConfig = new LiveEventsConfig()
    await checkConfigs()
  }
}

async function checkConfigs() {
  const game = await gameConfig.checkConfig()
  const live = await liveEventConfig.checkConfig()

  if (game && live) return

  const choice = dialog.showMessageBoxSync({
    type: "question",
    buttons: ["Yes", "No"],
    title: "Setup Game Configs",
    message: "The game config are missing or not complete! Do you want to automatically fix that to insure full functionality?"
  })

  if (choice === 1) {
    return
  } else {
    await gameConfig.setupConfig()
    await liveEventConfig.setupConfig()
  }
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});