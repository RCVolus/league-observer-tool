import { app, Menu, shell } from "electron";
import { LCU } from './connector/LCU'
import { Server } from './connector/Server'
import { store } from './index'

export class MainMenu {
  public mainMenu: Menu

  constructor(lcu: LCU, server: Server) {
    this.mainMenu = Menu.buildFromTemplate([
      {
        label: 'File',
        submenu: [
          {
            id: 'connect',
            label: 'Connect',
            enabled: true,
            click() {
              lcu.connect()
              server.connect()
            }
          },
          {
            id: 'disconnect',
            label: 'Disconnect',
            enabled: false,
            click() {
              lcu.disconnect()
              server.disconnect()
            }
          },
          {
            type: "separator"
          },
          {
            label: 'Open Settings',
            click() {
              store.openInEditor()
            }
          },
          {
            type: "separator"
          },
          {
            label: 'Quit',
            accelerator: 'CommandOrControl+Q',
            role: 'quit',
            click() {
              app.quit();
            }
          },
        ],
      },
      {
        label: 'Edit',
        submenu: [
          {
            label: 'Undo',
            accelerator: 'CommandOrControl+Z',
            role: 'undo',
          },
          {
            label: 'Redo',
            accelerator: 'Shift+CommandOrControl+Z',
            role: 'redo',
          },
          { type: 'separator' },
          {
            label: 'Cut',
            accelerator: 'CommandOrControl+X',
            role: 'cut',
          },
          {
            label: 'Copy',
            accelerator: 'CommandOrControl+C',
            role: 'copy',
          },
          {
            label: 'Paste',
            accelerator: 'CommandOrControl+V',
            role: 'paste',
          },
          {
            label: 'Select All',
            accelerator: 'CommandOrControl+A',
            role: 'selectAll',
          },
        ],
      },
      {
        id: 'tools',
        label: 'Tools',
        submenu: [],
      },
      {
        label: 'Window',
        submenu: [
          {
            label: 'Minimize',
            accelerator: 'CommandOrControl+M',
            role: 'minimize',
          },
          {
            label: 'Close',
            accelerator: 'CommandOrControl+W',
            role: 'close',
          },
          {
            label: 'Reload',
            accelerator: 'CommandOrControl+Shift+R',
            role: 'reload',
          },
        ],
      },
      {
        label: 'Help',
        role: 'help',
        submenu: [
          {
            label: 'Visit GitHub Repo',
            click() {
              shell.openExternal("https://github.com/RCVolus/league-observer-tool")
            }
          },
          {
            label: 'Report as Issue',
            click() {
              shell.openExternal("https://github.com/RCVolus/league-observer-tool/issues")
            }
          },
          {
            visible: !app.isPackaged,
            type: "separator"
          },
          {
            visible: !app.isPackaged,
            label: 'Toggle Developer Tools',
            click(item, focusedWindow) {
              //if (focusedWindow) focusedWindow.dev;
            }
          }
        ],
      }

    ]);

    Menu.setApplicationMenu(this.mainMenu);
  }
}