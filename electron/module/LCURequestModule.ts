import { ipcMain, dialog, app, MenuItem, Menu } from 'electron';
import * as path from "path";
import * as fs from "fs";
import { Sender } from '../helper/Sender';
import { Server } from '../connector/Server';
import { LCU } from '../connector/LCU'
import type { ServerRequest } from '../../types/ServerRequest'
import type { LPTEvent } from '../../types/LPTE'

export class LCURequestModule {
  private data : Array<any> = []
  public actions : [string, string][] = []
  private subMenu : Electron.MenuItem | null

  constructor (
    public id : string,
    public name : string,
    public namespace : string,
    public type : string,
    private lcu : LCU,
    private server : Server,
    private menu : Menu
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

  public connect () : void {
    Sender.send(this.id, 1)
    this.server.subscribe(this.namespace, this.type, (data) => this.handleData(data))
    Sender.send(this.id, 2)
    if (this.subMenu) {
      this.subMenu.checked = true
    }
  }

  private async handleData(data: LPTEvent) {
    const req = data as ServerRequest
    const res = await this.lcu.request(req.request)

    this.data.push({
      meta: req.meta,
      data: res
    })

    const obj : LPTEvent = {
      meta: {
        namespace: "reply",
        type: data.meta.reply as string,
        version: data.meta.version
      },
      data: res
    }
    Sender.send(`console`, obj)
    this.server.send(obj)
  }

  public disconnect () : void {
    this.server.unsubscribe(this.namespace, this.type);
    Sender.send(this.id, 0)
    if (this.subMenu) {
      this.subMenu.checked = false
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