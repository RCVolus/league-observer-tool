import { ipcMain, dialog, app, MenuItem, Menu } from 'electron';
import { join } from "path";
import { writeFile } from "fs/promises";
import { Sender } from '../helper/Sender';
import { Server } from '../connector/Server';
import { Socket, connect } from 'net';
import type { LPTEvent } from '../../types/LPTE'
import cfg from 'electron-cfg';
import { DisplayError } from '../../types/DisplayError';

export class LiveEventsModule {
  private data : Array<any> = []
  private netClient ? : Socket
  private port : number
  public actions : [string, string][] = []
  private subMenu : Electron.MenuItem | null
  private menuItem : Electron.MenuItem
  private interval ? : NodeJS.Timeout

  constructor (
    public id : string,
    public name : string,
    public namespace : string,
    public type : string,
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

    this.port = cfg.get("live-events-port", 34243)
    cfg.set("live-events-port", this.port)

    cfg.observe('server-ip', (current : number) => {
      this.port = current
    })
  }

  public connect () : void {
    if (!this.server.isConnected) {
      if (this.menuItem) {
        this.menuItem.checked = false
      }
      return
    }
    
    if (this.menuItem) {
      this.menuItem.checked = true
    }
    Sender.emit(this.id, 1)

    this.netClient = connect({port: this.port, host: "127.0.0.1"}, () => {
      Sender.emit(this.id, 2)
      if (this.interval) {
        clearInterval(this.interval)
      }
    });

    this.netClient?.on('data', (data) => {
      this.handleData(data)
    });

    this.netClient?.on("error", (err) => {
      Sender.emit(this.id, 1)
      Sender.emit('console', err)
      console.log(err)

      if (this.interval) {
        clearInterval(this.interval)
      }

      this.interval = setInterval(() => {
        this.connect()
      }, 10000)
    })
    
    this.netClient?.on('end', () => {
      Sender.emit(this.id, 1)
    });
  }

  private handleData (data: Buffer) {
    const dataString = data.toString()

    let newDataSting = dataString.replace(/(\\r\\n\\t|\n|\r|\\|\r\n|\t)/gm, "")
    newDataSting = newDataSting.replace(/(}{)/gm, "},{")
    const parsedData : Array<any> = JSON.parse(`[${newDataSting}]`)

    this.data.push(parsedData)

    try {
      const obj : LPTEvent = {
      meta: {
        namespace: this.namespace,
        type: this.type,
        version: 1
      },
      data: parsedData
    }
    this.server.send(obj)
    } catch (e: any) {
      Sender.emit('error', {
        color: "danger",
        text: e.message || 'error while sending data to prod tool'
      } as DisplayError)
    }
  }

  public disconnect () : void {
    Sender.emit(this.id, 0)

    if (this.menuItem) {
      this.menuItem.checked = false
    }

    this.netClient?.destroy();

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