import type { EventResponse } from 'league-connect'
import { ipcMain, /* dialog, app, */ MenuItem, type Menu } from 'electron';
/* import { join } from "path";
import { writeFile } from "fs/promises"; */
import { Sender } from '../helper/Sender';
import type { Server } from '../connector/Server';
import type { LCU } from '../connector/LCU'
import type { LPTEvent } from "../../types/LPTE";
import type { DisplayError } from '../../types/DisplayError';
import { Action } from '../../types/Action';
import log from 'electron-log';
import { FetchError } from 'electron-fetch';

export class LCUModule {
  //protected data: Array<any> = []
  public actions: [string, Action][] = []
  private subMenu: Electron.MenuItem | null
  private menuItem: Electron.MenuItem
  private isSynced = false
  protected logger: log.LogFunctions

  constructor(
    public id: string,
    public name: string,
    private lcuURI: string,
    protected lcu: LCU,
    protected server: Server,
    private menu: Menu,
    protected dataPoints?: Array<string>
  ) {
    this.logger = log.scope(id)

    ipcMain.handle(`${id}-start`, () => {
      this.connect()
    })
    ipcMain.handle(`${id}-stop`, () => {
      this.disconnect()
    })
    /* ipcMain.handle(`${id}-save`, () => {
      this.saveData()
    }) */

    this.subMenu = this.menu.getMenuItemById('tools')
    this.menuItem = new MenuItem({
      id: this.id,
      label: this.name,
      type: 'checkbox',
      checked: false,
      click: (e) => {
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

  public connect(): void {
    if (!this.server.isConnected) {
      if (this.menuItem) {
        this.menuItem.checked = false
      }
      return
    }

    Sender.emit(this.id, 1)
    this.isSynced = true

    this.requestData()
    this.lcu.subscribe(this.lcuURI, (data, event: EventResponse) => this.handleData(data, event))

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

      this.handleData(data, { eventType: 'Create' })
    } catch (e) {
      if ((e as FetchError).code && (e as FetchError).code === "ECONNREFUSED") {
        Sender.emit(this.id, 1)
      } else {
        this.disconnect()

        this.logger.error(e)
        Sender.emit('error', {
          color: "danger",
          text: (e as Error).message || 'error while fetching data from lcu'
        } as DisplayError)
      }
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async handleData(data: any, event: any): Promise<void> {
    /* this.data.push({data, event}) */

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let selectedData: { [n: string]: any } = {}
    if (!this.dataPoints) selectedData = data
    else {
      for (const key of this.dataPoints) {
        selectedData[key] = data[key]
      }
    }

    try {
      const obj: LPTEvent = {
        meta: {
          namespace: "lcu",
          type: `${this.id}-${event.eventType.toLowerCase()}`,
          timestamp: new Date().getTime() + this.server.prodTimeOffset
        },
        data: event.eventType != "Delete" ? selectedData : undefined
      }
      this.server.send(obj)
    } catch (e) {
      if ((e as FetchError).code && (e as FetchError).code === "ECONNREFUSED") {
        Sender.emit(this.id, 1)
      } else {
        this.disconnect()

        this.logger.error(e)
        Sender.emit('error', {
          color: "danger",
          text: (e as Error).message
        } as DisplayError)
      }
    }
  }

  public async disconnect(): Promise<void> {
    this.lcu.unsubscribe(this.lcuURI);
    Sender.emit(this.id, 0)
    this.isSynced = false
    if (this.menuItem) {
      this.menuItem.checked = false
    }
  }

/*   private async saveData() {
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
  } */
}