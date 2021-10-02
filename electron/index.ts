import { app, BrowserWindow, dialog, globalShortcut, ipcMain } from "electron";
import { createUserTasks } from "./userTasks";
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
import Store from 'electron-store';
import log from 'electron-log';

app.setAppUserModelId('gg.rcv.league-observer-tool')

autoUpdater.logger = log;

autoUpdater.autoDownload = false
let isQuiting = false
let skipClosing = false

let mainWindow : BrowserWindow
let initWindow : BrowserWindow

if (process.platform == "win32") {
  createUserTasks();
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
    createTray(mainWindow)

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

async function initApp () {
  autoUpdater.on('checking-for-update', () => {
    initWindow.webContents.send('state', 'checking')
  })
  autoUpdater.on('update-available', () => {
    initWindow.webContents.send('state', 'downloading')
    autoUpdater.downloadUpdate()
  })
  autoUpdater.on('download-progress', (progressInfo) => {
    initWindow.webContents.send('download-progress', progressInfo)
    initWindow.setProgressBar(progressInfo.percent / 100)
  })
  autoUpdater.on('update-not-available', () => {
    initWindow.webContents.send('state', 'finished')
    openMainWindow()
  })
  autoUpdater.on('update-downloaded', () => {
    initWindow.webContents.send('state', 'update-downloaded')
    skipClosing = true
    isQuiting = true
    autoUpdater.quitAndInstall();
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

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, '../frontend/public/index.html'));
  
  mainWindow.on('close', function (event: any) {
    if(!isQuiting){
        event.preventDefault();
        mainWindow?.hide();
    }
  
    return false;
  });

  mainWindow.webContents.on('did-finish-load', () => {
    initWindow.close()
    mainWindow.show()
  })

  const store = new Store();
  Sender.mainWindow = mainWindow
  const lcu = new LCU()
  const server = new Server(store)
  const menu = new MainMenu(lcu, server, store)
  new Modules(lcu, server, menu.mainMenu, store)

  ipcMain.on('connection-stop', () => {
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
}

app.on('before-quit', function (e) {
  if (!mainWindow) return

  if (skipClosing) {
    isQuiting = true;
    globalShortcut.unregisterAll()
    Sender.mainWindow = undefined
  } else {
    const choice = dialog.showMessageBoxSync(mainWindow, {
      type: 'question',
      buttons: ['Yes', 'No'],
      title: 'Confirm',
      message: 'Are you sure you want to quit?'
    });
  
    if (choice === 1) {
      isQuiting = false;
      e.preventDefault();
    } else {
      isQuiting = true;
      globalShortcut.unregisterAll()
      Sender.mainWindow = undefined
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
