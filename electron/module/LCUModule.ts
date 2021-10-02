import { EventResponse } from 'league-connect'
import { ipcMain, dialog, app, MenuItem, Menu } from 'electron';
import * as path from "path";
import * as fs from "fs";
import { Sender } from '../helper/Sender';
import { Server } from '../connector/Server';
import { LCU } from '../connector/LCU'
import type { LPTEvent } from "../../types/LPTE";

export class LCUModule {
  private data : Array<any> = []
  public actions : [string, string][] = []
  private subMenu : Electron.MenuItem | null

  constructor (
    public id : string,
    public name : string,
    private lcuURI : string,
    private lcu : LCU,
    private server : Server,
    private menu : Menu,
    private dataPoints? : Array<string>
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
    this.lcu.subscribe(this.lcuURI, (data: any, event: EventResponse) => this.handleData(data, event))
    Sender.send(this.id, 2)
    if (this.subMenu) {
      this.subMenu.checked = true
    }
  }

  private async handleData(data: any, event: any) {
    this.data.push({data, event})

    let selectedData : {[n: string]: any} = {}
    if (!this.dataPoints) selectedData = data
    else {
      for (const key of this.dataPoints) {
        selectedData[key] = data[key]
      }
    }

    const obj : LPTEvent = {
      meta: {
        namespace: "lcu",
        type: `${this.id}-${event.eventType.toLowerCase()}`, 
        timestamp: new Date().getTime() + this.server.prodTimeOffset
      },
      data: event.eventType != "Delete" ? selectedData : undefined
    }
    Sender.send(`console`, obj)
    this.server.send(obj)
  }

  public disconnect () : void {
    this.lcu.unsubscribe(this.lcuURI);
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