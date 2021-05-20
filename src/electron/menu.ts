import { app, Menu, shell } from "electron";
import { LCU } from './LCU'

export function createMainMenu (lcu: LCU) {
  const template = Menu.buildFromTemplate([
    {
      label: 'File',
      submenu: [
        {
          id: 'connect',
          label: 'Connect',
          enabled: true,
          click () {
            lcu.connect()
          }
        },
        {
          id: 'disconnect',
          label: 'Disconnect',
          enabled: false,
          click () {
            lcu.disconnect()
          }
        },
        {
          type: "separator"
        },
        {
          label: 'Quit',
          accelerator: 'CommandOrControl+Q',
          role: 'quit',
          click () {
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
      label: 'Tools',
      submenu: [
        {
          id: 'champ-select',
          label: 'Champselect',
          type: 'checkbox',
          checked: false,
          enabled: !!lcu.modules.has("champ-select"),
          click (e) {
            if (e.checked) {
              lcu.modules.get("champ-select")?.connect()
            } else {
              lcu.modules.get("champ-select")?.disconnect()
            }
          }
        },
        {
          id: 'end-of-game',
          label: 'End of Game',
          type: 'checkbox',
          checked: false,
          enabled: !!lcu.modules.has("end-of-game"),
          click (e) {
            if (e.checked) {
              lcu.modules.get("end-of-game")?.connect()
            } else {
              lcu.modules.get("end-of-game")?.disconnect()
            }
          }
        },
      ],
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
            shell.openExternal("https://github.com/RCVolus/league-prod-observer-tool")
          }
        },
        {
          label: 'Report as Issue',
          click() {
            shell.openExternal("https://github.com/RCVolus/league-prod-observer-tool/issues")
          }
        },
        {
          type: "separator"
        },
        {
          label: 'Toggle Developer Tools',
          click(item, focusedWindow) {
            if (focusedWindow) focusedWindow.webContents.toggleDevTools();
          }
        }
      ],
    }
  ]);

  Menu.setApplicationMenu(template);
  lcu.menu = template
}