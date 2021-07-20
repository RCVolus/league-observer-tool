import { ipcMain, dialog, app, MenuItem, Menu } from 'electron';
import * as path from "path";
import * as fs from "fs";
import { Sender } from './Sender';
import { Server } from './Server';
import settings from 'electron-app-settings';
import net from 'net';
import type { ServerMsg } from '../../types/ServerMsg'
import { MessageBuffer } from './MessageBuffer'

export class LiveEventsModule {
  private data : Array<any> = []
  //private msgBuffer = new MessageBuffer("\n")
  private netClient ? : net.Socket
  private port : number
  public actions : [string, string][] = []

  constructor (
    public id : string,
    public name : string,
    public namespace : string,
    public type : string,
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

    this.port = settings.get("live-events-port") || 34243
    settings.set("live-events-port", this.port)
  }

  public connect () : void {
    this.menu.getMenuItemById(this.id).checked = true

    this.netClient = net.connect({port: this.port, host: "127.0.0.1"}, () => {
      Sender.send(this.id, true)
    });
    this.netClient?.on('data', (data) => {
      this.handleData(data)
    });
    this.netClient?.on("error", (err) => {
      Sender.send('console', err)
    })
    this.netClient?.on('end', () => {
      Sender.send(this.id, false)
    });
  }

  private handleData (data: Buffer) {
    const dataString = data.toString()

    let newDataSting = dataString.replace(/(\\r\\n\\t|\n|\r|\\|\r\n|\t)/gm, "")
    newDataSting = newDataSting.replace(/(}{)/gm, "},{")
    const parsedData : Array<any> = JSON.parse(`[${newDataSting}]`)

    const obj : ServerMsg = {
      meta: {
        namespace: this.namespace,
        type: this.type,
        version: 1
      },
      data: parsedData
    }
    this.server.send(obj)
    this.data.push(parsedData)
    
    const filtered = parsedData.filter(e => e.eventname !== "OnNeutralMinionKill" && e.eventname !== "OnMinionKill")

    if (filtered.length > 0) {
      Sender.send(`console`, filtered)
    }
  }

  public disconnect () : void {
    Sender.send(this.id, false)
    this.menu.getMenuItemById(this.id).checked = false
    this.netClient?.destroy();
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