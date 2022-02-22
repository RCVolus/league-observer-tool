import { app, BrowserWindow, dialog, globalShortcut, ipcMain, Tray } from "electron";
import { createJumpLists } from "./jumpList";
import { Sender } from "./helper/Sender";
import * as path from "path";
import { LCU } from "./connector/LCU";
import { Server } from "./connector/Server";
import { MainMenu } from "./Menu";
import { Modules } from "./module/Modules";
import { autoUpdater } from "electron-updater"
import createMainWindow from "./window/mainWindow";
import createTray from "./tray";
import createInitWindow from "./window/initWindow";
import log from 'electron-log';

app.setAppUserModelId('gg.rcv.league-observer-tool')

autoUpdater.logger = log;

autoUpdater.autoDownload = false
let isQuitting = false
let skipClosing = false

let mainWindow : BrowserWindow
let initWindow : BrowserWindow
let tray : Tray

if (process.platform == "win32") {
  createJumpLists();
}
const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
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
    mainWindow = createMainWindow()
    initWindow = createInitWindow()

    initApp();
    tray = createTray(mainWindow)

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

async function initApp () {
  Sender.currentWindow = initWindow

  autoUpdater.on('checking-for-update', () => {
    Sender.emit('state', 'checking-app')
  })
  autoUpdater.on('update-available', () => {
    Sender.emit('state', 'downloading-app')
    autoUpdater.downloadUpdate()
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
    skipClosing = true
    isQuitting = true
    autoUpdater.quitAndInstall()
  })

  initWindow.webContents.on('did-finish-load', () => {
    initWindow.show()
    
    try {
      autoUpdater.checkForUpdates()
    } catch (e) {
      console.log(e)
    }
  })
}

function openMainWindow() {
  Sender.currentWindow = mainWindow

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, '../frontend/public/index.html'));

  createTray(mainWindow)

  mainWindow.webContents.on('did-finish-load', () => {
    initWindow.close()
    mainWindow.show()
  })

  const lcu = new LCU()
  const server = new Server()
  const menu = new MainMenu(lcu, server)
  new Modules(lcu, server, menu.mainMenu)

  ipcMain.handle('connection-stop', () => {
    const options = {
      buttons: ["Yes","Cancel"],
      type: "question",
      message: "Do you really want to disconnect?"
    }
    const choice = dialog.showMessageBoxSync(options)
    if (choice == 1) return

    lcu.disconnect()
    server.disconnect()
  })

  mainWindow.on('close', function (event: any) {
    if(!isQuitting){
      event.preventDefault();
    } else {
      lcu.disconnect()
      server.disconnect()
    }
  
    return false;
  });

  mainWindow.webContents.on('did-finish-load', () => {
    initWindow.close()
    mainWindow.show()
  })
}

app.on('before-quit', function (e) {
  if (!mainWindow) return

  if (skipClosing) {
    isQuitting = true;
    globalShortcut.unregisterAll()
  } else {
    const choice = dialog.showMessageBoxSync({
      type: 'question',
      buttons: ['Yes', 'No'],
      title: 'Confirm',
      message: 'Are you sure you want to quit?'
    });
  
    if (choice === 1) {
      isQuitting = false;
      e.preventDefault();
    } else {
      isQuitting = true;
      globalShortcut.unregisterAll()
    }
  }
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// SSL/TSL: this is the self signed certificate support
app.commandLine.appendSwitch('ignore-certificate-errors');
app.commandLine.appendSwitch('allow-insecure-localhost', 'true')
app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
  event.preventDefault();
  callback(true);
});