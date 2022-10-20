import { ipcMain, dialog, app, MenuItem, Menu } from 'electron';
import { join } from "path";
import { writeFile } from "fs/promises";
import { Sender } from '../helper/Sender';
import { Server } from '../connector/Server';
import type { LPTEvent } from '../../types/LPTE'
import fetch from 'electron-fetch'
import type { DisplayError } from '../../types/DisplayError';
import https from 'https';
import isEqual from 'lodash.isequal';

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

export class InGameApi {
  static url = "https://127.0.0.1:2999/liveclientdata/"
  private data : Array<any> = []
  public actions : [string, string][] = []
  private interval ? : NodeJS.Timeout
  private subMenu : Electron.MenuItem | null

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
    this.subMenu?.submenu?.append(new MenuItem({
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
    }))
  }

  /**
   * Gets information about the live-game if available and sets the interval
   * to get live game information
   * if live-game is not available, sends and error to the frontend 
  */
  public async connect () : Promise<void> {
    Sender.emit(this.id, 1)
    if (this.subMenu) {
      this.subMenu.checked = true
    }
    // get live-game data every 1s
    this.interval = setInterval(() => {
      this.getData()
    }, 1000)
  }

  /**
   * Gets data from the live-game api
  */
  private async getData () : Promise<void> {
    const fetchUrl = InGameApi.url + "allgamedata"

    try {
      const res = await fetch(fetchUrl, {
        agent: httpsAgent,
      })

      if (!res.ok) return

      const data = await res.json()

      const sameData = isEqual(
        data,
        this.data[this.data.length -1]
      )

      if (sameData) return

      this.data.push(data)

      const obj : LPTEvent = {
        meta: {
          namespace: this.namespace,
          type: 'allgamedata',
          version: 1
        },
        data: data
      }
      this.server.send(obj)

      Sender.emit(this.id, 2)
    } catch (e) {
      if (e.code && e.code === "ECONNREFUSED") {
        Sender.emit(this.id, 1)
      } else {
        Sender.emit('error', {
          color: "danger",
          text: e.message || 'error while fetching live-game data'
        } as DisplayError)
      }
    }
  }

  /**
   * Clears timeout to stop requesting live-game data
  */
  public disconnect () : void {
    Sender.emit(this.id, 0)

    if (this.subMenu) {
      this.subMenu.checked = false
    }

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