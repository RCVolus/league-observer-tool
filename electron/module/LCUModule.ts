import { EventResponse } from 'league-connect'
import { ipcMain, dialog, app, MenuItem, Menu } from 'electron';
import { join } from "path";
import { writeFile } from "fs/promises";
import { Sender } from '../helper/Sender';
import { Server } from '../connector/Server';
import { LCU } from '../connector/LCU'
import type { LPTEvent } from "../../types/LPTE";
import { DisplayError } from '../../types/DisplayError';

export class LCUModule {
  protected data : Array<any> = []
  public actions : [string, string][] = []
  private subMenu : Electron.MenuItem | null
  private menuItem : Electron.MenuItem
  private isSynced = false

  constructor (
    public id : string,
    public name : string,
    private lcuURI : string,
    protected lcu : LCU,
    protected server : Server,
    private menu : Menu,
    private dataPoints? : Array<string>
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
      this.requestData()
    })
  }

  public connect () : void {
    Sender.emit(this.id, 1)
    this.isSynced = true

    this.requestData()
    this.lcu.subscribe(this.lcuURI, (data: any, event: EventResponse) => this.handleData(data, event))

    Sender.emit(this.id, 2)

    if (this.menuItem) {
      this.menuItem.checked = true
    }
  }

  private async requestData() {
    try {
      const data = await this.lcu.request({
        url: this.lcuURI,
        method: 'GET'
      })

      if (data === undefined) return
  
      this.handleData(data, { eventType: 'Update' })
    } catch (e) {
      Sender.emit('error', {
        color: "danger",
        text: e.message || 'error while fetching data from lcu'
      } as DisplayError)
    }
  }

  async handleData(data: any, event: any): Promise<void> {
    this.data.push({data, event})

    let selectedData : {[n: string]: any} = {}
    if (!this.dataPoints) selectedData = data
    else {
      for (const key of this.dataPoints) {
        selectedData[key] = data[key]
      }
    }

    try {
      const obj : LPTEvent = {
        meta: {
          namespace: "lcu",
          type: `${this.id}-${event.eventType.toLowerCase()}`, 
          timestamp: new Date().getTime() + this.server.prodTimeOffset
        },
        data: event.eventType != "Delete" ? selectedData : undefined
      }
      this.server.send(obj)
    } catch (e) {
      Sender.emit('error', {
        color: "danger",
        text: e.message || 'error while sending data to prod tool'
      } as DisplayError)
    }
  }

  public disconnect () : void {
    this.lcu.unsubscribe(this.lcuURI);
    Sender.emit(this.id, 0)
    this.isSynced = false
    if (this.menuItem) {
      this.menuItem.checked = false
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