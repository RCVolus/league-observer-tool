import { app, BrowserWindow, Menu, Tray, nativeImage } from "electron";
import { LCU } from "./LCU";
import { createMainMenu } from "./menu";
import * as path from "path";

let isQuiting = false
let tray : Tray | null = null
let mainWindow : BrowserWindow | null = null
const LcuAPI = new LCU()

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    height: 700,
    width: 400,
    title: "League production observer tool",
    webPreferences: {
      nodeIntegration: true,
      worldSafeExecuteJavaScript: true,
      preload: path.join(__dirname, "preload.js"),
    }
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, '../public/index.html'));

  mainWindow.on('minimize',function(event: any){
    event.preventDefault();
    mainWindow?.hide();
  });
  
  mainWindow.on('close', function (event: any) {
    if(!isQuiting){
        event.preventDefault();
        mainWindow?.hide();
    }
  
    return false;
  });

  LcuAPI.mainWindow = mainWindow
}

function createTray () {
  const execPath = __dirname.replace("\\app.asar", "");
  const iconPatch = path.join(execPath, "../assets/icons/icon.ico")
  const icon = nativeImage.createFromPath(iconPatch)
  tray = new Tray(icon)
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show App',
      icon: icon.resize({width:16}),
      click: function(){
        mainWindow?.show();
      } 
    },
    {
      type: "separator"
    },
    {
      label: 'Quit',
      click: function() {
        app.quit();
      } 
    }
  ])
  tray.setToolTip('League production observer tool')
  tray.setContextMenu(contextMenu)
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", () => {
  createWindow();
  createTray();
  createMainMenu(LcuAPI);

  app.on("activate", function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('before-quit', function () {
  isQuiting = true;
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