import { ipcMain, dialog, app, MenuItem, Menu } from 'electron';
import { join } from "path";
import { writeFile } from "fs/promises";
import { Sender } from '../helper/Sender';
import { Server } from '../connector/Server';
import type { LPTEvent } from '../../types/LPTE'
import type { DisplayError } from '../../types/DisplayError';
import { connectToLeague, disconnectFromLeague, isReady, makeSnapshot } from "@larseble/farsight";


export class Farsight {
  private data : Array<any> = []
  public actions : [string, string][] = []
  private interval ? : NodeJS.Timeout
  private subMenu : MenuItem | null
  private menuItem : MenuItem
  private isSynced = false
  private isConnected = false

  constructor (
    public id : string,
    public name : string,
    public namespace : string,
    private server : Server,
    private menu : Menu
  ) {
    ipcMain.handle(`${id}-start`, () => {
      this.connect()
    })
    ipcMain.handle(`${id}-stop`, () =>{
      this.disconnect()
    })
    ipcMain.handle(`${id}-save`, () => {
      this.saveData()
    })

    this.subMenu = this.menu.getMenuItemById('tools')
    this.menuItem = new MenuItem({
      id: this.id,
      label: this.name,
      type: 'checkbox',
      checked: false,
      click : (e) => {
        if (e.checked) {
          this.connect()
        } else {
          this.disconnect()
        }
      }
    })
    this.subMenu?.submenu?.append(this.menuItem)

    this.server.onConnected(() => {
      if (!this.isSynced) return
      this.getData()
    })
  }

  /**
   * Gets information about the live-game if available and sets the interval
   * to get live game information
   * if live-game is not available, sends and error to the frontend 
  */
  public async connect () : Promise<void> {
    if (!this.server.isConnected) {
      if (this.menuItem) {
        this.menuItem.checked = false
      }
      return
    }

    Sender.emit(this.id, 1)

    if (this.menuItem) {
      this.menuItem.checked = true
    }

    const res = await connectToLeague()
    this.isConnected = res

    if(res && isReady()) {
        Sender.emit(this.id, 2)
    }

    // get live-game data every 1s
    this.interval = setInterval(async () => {
      this.getData()
    }, 1000)
  }

  /**
   * Gets data from the live-game api
  */
  private async getData () : Promise<void> {
    try {
      if(!isReady() || !this.isConnected) {
        this.isConnected = await connectToLeague()
        return
      }

      const data = makeSnapshot()
      console.log(data)
      this.data.push(data)

      const obj : LPTEvent = {
        meta: {
          namespace: this.namespace,
          type: 'farsight-data',
          version: 1
        },
        data: data
      }
      this.server.send(obj)

      Sender.emit(this.id, 2)
    } catch (e: any) {
      if (e.code && e.code === "ECONNREFUSED") {
        Sender.emit(this.id, 1)
      } else {
        Sender.emit('error', {
          color: "danger",
          text: e.message || 'error while fetching game data'
        } as DisplayError)
      }
    }
  }

  /**
   * Clears timeout to stop requesting live-game data
  */
  public disconnect () : void {
    Sender.emit(this.id, 0)

    if (this.menuItem) {
      this.menuItem.checked = false
    }

    disconnectFromLeague()

    if (this.interval) {
      clearInterval(this.interval)
    }
  }

  private async saveData () {
    const saveDialog = await dialog.showSaveDialog({
      title: 'Select the File Path to save',
      defaultPath: join(app.getPath('documents'), `../Observer Tool/${this.name}-data.json`),
      buttonLabel: 'Save',
      filters: [
          {
              name: 'Text Files',
              extensions: ['json']
          }, 
      ],
      properties: []
    })

    if (!saveDialog.canceled && saveDialog.filePath) {
      const saveData = JSON.stringify(this.data, null, 2)
      const savePath = saveDialog.filePath.toString()
      await writeFile(savePath, saveData)
    }
  }
}