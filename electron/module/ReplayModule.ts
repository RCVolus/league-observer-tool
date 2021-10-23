import { ipcMain, dialog, app, MenuItem, Menu, globalShortcut } from 'electron';
import * as path from "path";
import * as fs from "fs";
import { Sender } from '../helper/Sender';
import { Server } from '../connector/Server';
import fetch from 'node-fetch'
import https from "https";
import type { DisplayError } from '../../types/DisplayError';
import cfg from 'electron-cfg';

const fetchOption = {
  agent: new https.Agent({
    rejectUnauthorized: false
  })
}

export class ReplayModule {
  static replayUrl = "https://127.0.0.1:2999/replay/"
  private playbackInterval ? : NodeJS.Timeout
  private renderInterval ? : NodeJS.Timeout
  private subMenu : Electron.MenuItem | null
  private playbackData ? : {
    savedAt: number
    time: number
  }
  private renderData : any = {}
  public actions : [string, string][] = [
    ["sync-replay", "Sync to first Operator"],
    ["sync-replay-minus-5", "Sync to first Operator (-5 sec)"],
    ["sync-replay-plus-5", "Sync to first Operator (+5 sec)"],
  ]
  private syncMode : "get" | "send"
  public isConnected = false

  constructor (
    public id : string,
    public name : string,
    public namespace : string,
    public type : string,
    private server : Server,
    private menu : Menu,
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
    ipcMain.handle(`${id}-sync-replay`, () => {
      this.syncReplay()
    })
    ipcMain.handle(`${id}-sync-replay-minus-5`, () => {
      this.syncReplay(-5)
    })
    ipcMain.handle(`${id}-sync-replay-plus-5`, () => {
      this.syncReplay(5)
    })

    this.syncMode = cfg.get("replay-sync-mode", "get") as "get" | "send"
    cfg.set("replay-sync-mode", this.syncMode)

    cfg.observe('server-ip', (current : "get" | "send") => {
      this.syncMode = current
      
      if (this.isConnected) {
        this.disconnect()
        this.connect()
      }
    })

    this.subMenu = this.menu.getMenuItemById('tools')
    this.subMenu?.submenu?.append(new MenuItem({
      label: this.name,
      submenu: [
        {
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
        },
        {
          type: "separator"
        },
        {
          id: this.id + "_send_playback",
          label: "Send Information",
          type: "radio",
          checked: this.syncMode === 'send',
          click: () => {
            this.sendPlayback()
            cfg.set("replay-sync-mode", "send")
          }
        },
        {
          id: this.id + "_get_playback",
          label: "Get Information",
          type: "radio",
          checked: this.syncMode === 'get',
          click: () => {
            this.getPlayback()
            cfg.set("replay-sync-mode", "get")
          }
        },
        {
          type: "separator"
        },
        {
          type: 'normal',
          label: 'Sync to first Operator',
          accelerator: 'Ctrl+J',
          click: () => {
            this.syncReplay()
          }
        },
        {
          type: 'normal',
          label: 'Sync to first Operator (-5 sec)',
          accelerator: 'Ctrl+K',
          click: () => {
            this.syncReplay(-5)
          }
        },
        {
          type: 'normal',
          label: 'Sync to first Operator (+5 sec)',
          accelerator: 'Ctrl+L',
          click: () => {
            this.syncReplay(5)
          }
        }
      ]
    }))
  }

  public connect () : void {
    if (this.subMenu) {
      this.subMenu.checked = true
    }

    Sender.emit(this.id, 1)

    if (this.syncMode == "get") {
      setTimeout(() => {
        this.getPlayback()
      }, 0)
    } else if (this.syncMode == "send") {
      setTimeout(() => {
        this.sendPlayback()
      }, 0)
    }

    globalShortcut.register('CommandOrControl+J', () => {
      this.syncReplay()
    })
    globalShortcut.register('CommandOrControl+K', () => {
      this.syncReplay(-5)
    })
    globalShortcut.register('CommandOrControl+L', () => {
      this.syncReplay(5)
    })

    /* this.renderInterval = setInterval(async () => {
      await this.handleRenderer()
    }, 5000) */
  }

  private sendPlayback () {
    if (!this.subMenu?.checked) return

    this.server.unsubscribe(this.namespace, this.type)
    this.playbackInterval = setInterval(() => {
      this.handleSandingPlayback()
    }, 5000)
    this.handleSandingPlayback()
  }

  private async handleSandingPlayback () {
    const fetchUri = ReplayModule.replayUrl + "playback"

    try {
      const res = await fetch(fetchUri, fetchOption)
  
      if (!res.ok) return
  
      const json = await res.json()
      const savedAt = new Date().getTime() + this.server.prodTimeOffset
      const time = json.time
      this.playbackData = {
        savedAt,
        time
      }
      this.server.send({
        meta: {
          namespace: "league-replay",
          type: "set-playback",
          version: 1
        },
        savedAt,
        time
      })

      this.isConnected = true
      Sender.emit(this.id, 2)
    } catch (e) {
      if (e.code && e.code === "ECONNREFUSED") {
        Sender.emit(this.id, 1)
      } else {
        this.disconnect()
        Sender.emit('error', {
          color: "danger",
          text: e.message || 'error while fetching live-game data'
        } as DisplayError)
      }
    }
  }

  private syncReplay (delay = 0) {
    if (!this.playbackData) return

    try {
      const diff = ((new Date().getTime() + this.server.prodTimeOffset) - this.playbackData.savedAt) / 1000
      const time = this.playbackData.time + diff + delay

      const uri = ReplayModule.replayUrl + "playback"
      fetch(uri, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          time: time >= 0 ? time : 0
        }),
        redirect: 'follow',
        ...fetchOption
      })
    } catch (e) {
      Sender.emit('console', e)
    }
  }

  /* private async handleRenderer () {
    try {
      const uri = ReplayModule.replayUrl + "render"
      const res = await fetch(uri, option)
  
      if (!res.ok) return
  
      const json = await res.json()
      this.renderData = json
      this.server.send({
        meta: {
          namespace: "league-replay",
          type: "set-render",
          version: 1
        },
        data: json
      })
    } catch (e) {
      Sender.emit('console', e)
    }
  } */

  private getPlayback () {
    if (!this.subMenu?.checked) return

    if (this.playbackInterval) {
      clearInterval(this.playbackInterval)
    }

    this.server.subscribe(this.namespace, this.type, (data) => {
      this.playbackData = {
        savedAt: data.savedAt,
        time: data.time
      }
    })

    this.isConnected = true
    Sender.emit(this.id, 2)
  }

  public disconnect () : void {
    this.server.unsubscribe(this.namespace, this.type)
    if (this.playbackInterval) {
      clearInterval(this.playbackInterval)
    }
    if (this.renderInterval) {
      clearInterval(this.renderInterval)
    }

    this.isConnected = false
    Sender.emit(this.id, 0)

    if (this.subMenu) {
      this.subMenu.checked = false
    }

    globalShortcut.unregister('CommandOrControl+J')
    globalShortcut.unregister('CommandOrControl+K')
    globalShortcut.unregister('CommandOrControl+L')
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
      const saveData = JSON.stringify({
        playback: this.playbackData,
        render: this.renderData
      })
      const savePath = saveDialog.filePath.toString()
      fs.writeFile(savePath, saveData, (err) => {
          if (err) throw err;
      });
    }
  }
}