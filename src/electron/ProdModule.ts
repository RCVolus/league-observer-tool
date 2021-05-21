import { EventResponse } from 'league-connect'
import { ipcMain, dialog, app, MenuItem, Menu } from 'electron';
import * as path from "path";
import * as fs from "fs";
import { Sender } from './Sender';
import { Server } from './Server';
import { LCU } from './LCU'

export class ProdModule {
  private data : Array<any> = []

  constructor (
    private id : string,
    private name : string,
    private lcuURI : string,
    private lcu : LCU,
    private server : Server,
    private menu : Menu,
    private dataPoints? : Array<string>
  ) {
    ipcMain.on(`lcu-${id}-start`, () => {
      this.connect()
    })
    ipcMain.on(`lcu-${id}-stop`, () =>{
      this.disconnect()
    })
    ipcMain.on(`lcu-${id}-save`, () => {
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

  public connect () {
    this.lcu.subscribe(this.lcuURI, (data: any, event: EventResponse) => this.handleData(data, event))
    Sender.send(`lcu-${this.id}`, true)
    this.menu.getMenuItemById(this.id).checked = true
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

    const obj = {
      meta: {
        namespace: "lcu",
        type: `${this.name}-${event.eventType.toLowerCase()}`
      },
      data: event.eventType != "Delete" ? selectedData : undefined
    }
    this.server.send(JSON.stringify(obj))
  }

  public disconnect () {
    this.lcu.unsubscribe(this.lcuURI);
    Sender.send(`lcu-${this.id}`, false)
    this.menu.getMenuItemById(this.id).checked = false
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