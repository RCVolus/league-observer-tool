import { ipcMain, dialog, app, MenuItem, Menu } from 'electron';
import * as path from "path";
import * as fs from "fs";
import { Sender } from './Sender';
import { Server } from './Server';
import fetch from 'node-fetch'
import settings from 'electron-app-settings';
import https from "https";

const option = {
  agent: new https.Agent({
    rejectUnauthorized: false
  })
}

export class ReplayModule {
  static replayUrl = "https://localhost:2999/replay/"
  private playbackInterval ? : ReturnType<typeof setInterval>
  private renderInterval ? : ReturnType<typeof setInterval>
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
    ipcMain.on(`${id}-sync-replay`, () => {
      this.syncReplay()
    })
    ipcMain.on(`${id}-sync-replay-minus-5`, () => {
      this.syncReplay(-5)
    })
    ipcMain.on(`${id}-sync-replay-plus-5`, () => {
      this.syncReplay(5)
    })

    this.menu.getMenuItemById('tools').submenu?.append(new MenuItem({
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
          checked: true,
          click: () => {
            this.sendPlayback()
          }
        },
        {
          id: this.id + "_get_playback",
          label: "Get Information",
          type: "radio",
          click: () => {
            this.getPlayback()
          }
        }
      ]
    }))

    const syncMode = settings.get("replay-sync-mode") || "get"
    settings.set("replay-sync-mode", syncMode)
    if (syncMode == "send") this.sendPlayback()
    else if (syncMode == "get") this.getPlayback()
  }

  public connect () : void {
    Sender.send(this.id, true)
    this.menu.getMenuItemById(this.id).checked = true

    if (this.menu.getMenuItemById(this.id + "_get_playback").checked) {
      this.getPlayback()
    } else if (this.menu.getMenuItemById(this.id + "_send_playback").checked) {
      this.sendPlayback()
    }

    /* this.renderInterval = setInterval(async () => {
      await this.handleRenderer()
    }, 5000) */
  }

  private sendPlayback () {
    this.menu.getMenuItemById(this.id + "_send_playback").checked = true
    settings.set("replay-sync-mode", "send")
    if (!this.menu.getMenuItemById(this.id).checked) return

    this.server.unsubscribe(this.namespace, this.type)
    this.playbackInterval = setInterval(async () => {
      await this.handleSandingPlayback()
    }, 5000)
    this.handleSandingPlayback()
  }

  private async handleSandingPlayback () {
    try {
      const uri = ReplayModule.replayUrl + "playback"
      const res = await fetch(uri, option)
  
      if (!res.ok) return
  
      const json = await res.json()
      this.playbackData = {
        savedAt: new Date().getTime(),
        time: json.time
      }
      this.server.send({
        meta: {
          namespace: "league-replay",
          type: "set-playback",
          version: 1
        },
        time: json.time
      })
    } catch (e) {
      Sender.send('console', e)
    }
  }

  private syncReplay (delay = 0) {
    if (!this.playbackData) return

    try {
      const diff = (new Date().getTime() - this.playbackData.savedAt) / 1000
      const time = this.playbackData.time + diff + 1.75 + delay

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
        ...option
      })
    } catch (e) {
      Sender.send('console', e)
    }
  }

  private async handleRenderer () {
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
      Sender.send('console', e)
    }
  }

  private getPlayback () {
    this.menu.getMenuItemById(this.id + "_get_playback").checked = true
    settings.set("replay-sync-mode", "get")
    if (!this.menu.getMenuItemById(this.id).checked) return

    if (this.playbackInterval) {
      clearInterval(this.playbackInterval)
    }

    this.server.subscribe(this.namespace, this.type, (data) => {
      this.playbackData = {
        savedAt: new Date().getTime(),
        time: data.time
      }
    })
  }

  public disconnect () : void {
    Sender.send(this.id, false)
    this.menu.getMenuItemById(this.id).checked = false
    this.server.unsubscribe(this.namespace, this.type)
    if (this.playbackInterval) {
      clearInterval(this.playbackInterval)
    }
    if (this.renderInterval) {
      clearInterval(this.renderInterval)
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
      const saveData = JSON.stringify({
        playback: this.playbackData,
        render: this.renderData
      })
      const savePath = saveDialog.filePath.toString()
      fs.writeFile(savePath, saveData, (err) => {
          if (err) throw err;
          Sender.send('console', `Saved at ${savePath}`)
      });
    }
  }
}