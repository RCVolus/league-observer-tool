import { ipcMain, dialog, app, MenuItem, Menu } from 'electron';
import * as path from "path";
import * as fs from "fs";
import { Sender } from './Sender';
import { Server } from './Server';
import type { ServerMsg } from '../../types/ServerMsg'
import fetch from 'node-fetch'
import type { DisplayError } from '../../types/DisplayError';
import https from 'https';

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

export class InGameApi {
  private data : Array<any> = []
  private url = "https://127.0.0.1:2999/liveclientdata"
  public actions : [string, string][] = []
  private interval ? : NodeJS.Timeout

  constructor (
    public id : string,
    public name : string,
    public namespace : string,
    private server : Server,
    private menu : Menu,
  ) {
    ipcMain.on(`${id}-start`, () => {
      this.connect()
    })
    ipcMain.on(`${id}-stop`, () =>{
      this.disconnect()
    })
    ipcMain.on(`${id}-save`, () => {
      this.saveData()
    })

    this.menu.getMenuItemById('tools').submenu?.append(new MenuItem({
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
    const fetchUrl = this.url + "/gamestats"
    Sender.send('console', fetchUrl)

    try {
      const gameInfo = await fetch(fetchUrl, {
        agent: httpsAgent,
      })
      const data = await gameInfo.json()

      const obj : ServerMsg = {
        meta: {
          namespace: this.namespace,
          type: 'gamestats',
          version: 1
        },
        data: data
      }
      this.server.send(obj)
      this.data.push(data)

      // get live-game data every 1s
      this.interval = setInterval(() => {
        this.getData()
      }, 1000)

      this.menu.getMenuItemById(this.id).checked = true
      Sender.send(this.id, true)
    } catch (e) {
      Sender.send('console', e)
      if (e.code && e.code === "ECONNREFUSED") {
        return Sender.send('error', {
          color: "danger",
          text: 'There is no live game available'
        } as DisplayError)
      } else {
        Sender.send('error', {
          color: "danger",
          text: e.message || 'error while fetching live-game data'
        } as DisplayError)
      }
    }
  }

  /**
   * Gets data from the live-game api
  */
  private async getData () : Promise<void> {
    const fetchUrl = this.url + "/allgamedata"
    Sender.send('console', fetchUrl)

    try {
      const gameInfo = await fetch(fetchUrl, {
        agent: httpsAgent,
      })
      const data = await gameInfo.json()

      const obj : ServerMsg = {
        meta: {
          namespace: this.namespace,
          type: 'allgamedata',
          version: 1
        },
        data: data
      }
      this.server.send(obj)
      this.data.push(data)
    } catch (e) {
      this.disconnect()
      Sender.send('console', e)
      if (e.code && e.code === "ECONNREFUSED") {
        return Sender.send('error', {
          color: "danger",
          text: 'There is no live game available'
        } as DisplayError)
      } else {
        Sender.send('error', {
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
    Sender.send(this.id, false)
    this.menu.getMenuItemById(this.id).checked = false
    if (this.interval) {
      clearInterval(this.interval)
    }
  }

  private async saveData () {
    const saveDialog = await dialog.showSaveDialog({
      title: 'Select the File Path to save',
      defaultPath: path.join(app.getPath('documents'), `../Observer Tool/${this.name}-data.json`),
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
      const saveData = JSON.stringify(this.data)
      const savePath = saveDialog.filePath.toString()
      fs.writeFile(savePath, saveData, (err) => {
          if (err) throw err;
          Sender.send('console', `Saved at ${savePath}`)
      });
    }
  }
}