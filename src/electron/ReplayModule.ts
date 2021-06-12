import { ipcMain, dialog, app, MenuItem, Menu } from 'electron';
import * as path from "path";
import * as fs from "fs";
import { Sender } from './Sender';
import { Server } from './Server';
import fetch from 'node-fetch'
import settings from 'electron-app-settings';
import https from "https";

const options = {
  agent: new https.Agent({
    rejectUnauthorized: false
  })
};


export class ReplayModule {
  static replayUrl = "https://localhost:2999/replay/"
  private playbackTimeout ? : ReturnType<typeof setTimeout>
  private renderTimeout ? : ReturnType<typeof setTimeout>
  private playbackData : any[] = []
  private renderData : any[] = []
  public actions : [string, string][] = [
    ["sync-replay", "Sync to first Operator"]
  ]

  constructor (
    public id : string,
    public name : string,
    private namespace : string,
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
          click: this.sendPlayback
        },
        {
          id: this.id + "_get_playback",
          label: "Send Information",
          type: "radio",
          click: this.getPlayback,
          checked: true
        }
      ]
    }))

    const syncMode = settings.get("replay-sync-mode") || "get"
    settings.set("replay-sync-mode", syncMode)
    if (syncMode == "send") this.sendPlayback()
    else if (syncMode == "get") this.getPlayback()
  }

  public connect () {
    Sender.send(this.id, true)
    this.menu.getMenuItemById(this.id).checked = true

    if (this.menu.getMenuItemById(this.id + "_get_playback").checked) {
      this.getPlayback()
    } else if (this.menu.getMenuItemById(this.id + "_send_playback").checked) {
      this.sendPlayback()
    }

    //this.renderTimeout = setTimeout(this.handleRenderer, 10000)
  }

  private async sendPlayback() {
    this.menu.getMenuItemById(this.id + "_send_playback").checked = true
    settings.set("replay-sync-mode", "send")
    if (!this.menu.getMenuItemById(this.id).checked) return

    this.server.unsubscribe(this.namespace)
    this.playbackTimeout = setTimeout(this.handleSanding, 7500)
    this.handleSanding()
  }

  private async handleSanding () {
    try {
      const uri = ReplayModule.replayUrl + "playback"
      const res = await fetch(uri, options)
  
      if (!res.ok) return

      Sender.send('console', this.playbackData)
  
      const json = await res.json()
      this.playbackData.push(json)
      this.server.send({
        meta: {
          namespace: "league-replay",
          type: "set-playback",
          version: 1,
          timestamp: new Date().getTime()
        },
        data: json
      })
    } catch (e) {
      Sender.send('console', e)
    }
  }

  private syncReplay () {
    try {
      const uri = ReplayModule.replayUrl + "playback"
      fetch(uri, {
        ...options,
        method: "POST",
        body: this.playbackData[this.playbackData.length - 1]
      })
    } catch (e) {
      Sender.send('console', e)
    }
  }

  private async handleRenderer () {
    try {
      const uri = ReplayModule.replayUrl + "render"
      const res = await fetch(uri, options)

      Sender.send('console', this.renderData)
  
      if (!res.ok) return
  
      const json = await res.json()
      this.renderData.push(json)
      this.server.send({
        meta: {
          namespace: "league-replay",
          type: "set-render",
          version: 1,
          timestamp: new Date().getTime()
        },
        data: json
      })
    } catch (e) {
      Sender.send('console', e)
    }
  }

  private async getPlayback() {
    this.menu.getMenuItemById(this.id + "_get_playback").checked = true
    settings.set("replay-sync-mode", "get")
    if (!this.menu.getMenuItemById(this.id).checked) return

    if (this.playbackTimeout) {
      clearTimeout(this.playbackTimeout)
    }

    this.server.subscribe(this.namespace, (data) => {
      this.playbackData = [...this.playbackData, data.data]
    })
  }

  public disconnect () {
    Sender.send(this.id, false)
    this.menu.getMenuItemById(this.id).checked = false
    this.server.unsubscribe(this.namespace)
    if (this.playbackTimeout) {
      clearTimeout(this.playbackTimeout)
    }
    if (this.renderTimeout) {
      clearTimeout(this.renderTimeout)
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