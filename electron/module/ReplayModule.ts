import { ipcMain, dialog, app, MenuItem, Menu, globalShortcut } from 'electron';
import { join } from "path";
import { writeFile } from "fs/promises";
import { Sender } from '../helper/Sender';
import { Server } from '../connector/Server';
import fetch from 'electron-fetch'
import { Agent } from "https";
import type { DisplayError } from '../../types/DisplayError';
import cfg from 'electron-cfg';
import { keyboard } from '@nut-tree/nut-js'
import { Key } from '@nut-tree/nut-js/dist/lib/key.enum';


const fetchOption = {
  agent: new Agent({
    rejectUnauthorized: false
  })
}

export class ReplayModule {
  static replayUrl = "https://127.0.0.1:2999/replay/"
  private playbackInterval ? : NodeJS.Timeout
  private renderInterval ? : NodeJS.Timeout
  private subMenu : Electron.MenuItem | null
  private menuItem : Electron.MenuItem
  private playbackData ? : {
    savedAt: number
    time: number
  }
  private renderData : any = {}
  public actions : [string, string][] = [
    ["sync-replay", "Sync to first Operator"],
    ["sync-replay-plus-5", "Sync to first Operator (+5 sec)"],
    ["sync-replay-plus-10", "Sync to first Operator (+10 sec)"],
    ["cinematic-ui", "Set up UI for cinematic"],
    ["obs-ui", "Set up UI for Observing"],
  ]
  private syncMode : "get" | "send"
  public isSynced = false
  private interfaceState = {
    'interfaceAll' : true,
    'healthBarChampions' : true,
    'healthBarMinions' : true,
    'healthBarStructures' : true,
    'interfaceScoreboard' : true,
    'healthBarWards' : true,
    'interfaceNeutralTimers' : true,
    'interfaceChat' : false,
    'interfaceKillCallouts' : false,
    'interfaceTimeline' : false,
  }

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
    ipcMain.handle(`${id}-sync-replay-plus-5`, () => {
      this.syncReplay(5)
    })
    ipcMain.handle(`${id}-sync-replay-plus-10`, () => {
      this.syncReplay(10)
    })
    ipcMain.handle(`${id}-cinematic-ui`, () => {
      this.cinematicUI()
    })
    ipcMain.handle(`${id}-obs-ui`, () => {
      this.obsUI()
    })

    this.syncMode = cfg.get("replay-sync-mode", "get") as "get" | "send"
    cfg.set("replay-sync-mode", this.syncMode)

    cfg.observe('server-ip', (current : "get" | "send") => {
      this.syncMode = current
      
      if (this.isSynced) {
        this.disconnect()
        this.connect()
      }
    })

    this.subMenu = this.menu.getMenuItemById('tools')
    this.menuItem = new MenuItem({
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
            this.syncMode = 'send'
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
            this.syncMode = 'get'
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
    })

    this.subMenu?.submenu?.append(this.menuItem)

    this.server.onConnected(() => {
      if (!this.isSynced) return
      if (this.syncMode == "get") {
        setTimeout(() => {
          this.getPlayback()
        }, 0)
      } else if (this.syncMode == "send") {
        setTimeout(() => {
          this.sendPlayback()
        }, 0)
      }
    })
  }

  public connect () : void {
    if (!this.server.isConnected) {
      if (this.menuItem.submenu) {
        this.menuItem.submenu.items[0].checked = false
      }
      return
    }

    Sender.emit(this.id, 1)

    if (this.menuItem.submenu) {
      this.menuItem.submenu.items[0].checked = true
    }

    if (this.syncMode == "get") {
      setTimeout(() => {
        this.getPlayback()
      }, 0)
    } else if (this.syncMode == "send") {
      setTimeout(() => {
        this.sendPlayback()
      }, 0)
      this.server.subscribe('module-league-caster-cockpit', 'show-gold', () => {
        keyboard.type(Key.X)
      })
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
  }

  private sendPlayback () {
    if (!this.menuItem.submenu?.items[2].checked) return

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
      const newData = {
        savedAt,
        time
      }

      this.playbackData = newData
      this.server.send({
        meta: {
          namespace: this.namespace,
          type: "set-playback",
          version: 1
        },
        savedAt,
        time
      })

      this.isSynced = true
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

  cinematicUI (): void {
    const uri = ReplayModule.replayUrl + "render"

    const setup = this.interfaceState
    setup.interfaceChat = false
    setup.interfaceAll = false
    setup.healthBarChampions = false
    setup.healthBarMinions = false
    setup.healthBarStructures = false
    setup.healthBarWards = false

    fetch(uri, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(setup),
      redirect: 'follow',
      ...fetchOption
    })
  }

  obsUI (): void {
    const uri = ReplayModule.replayUrl + "render"

    const setup = this.interfaceState
    setup.interfaceChat = false
    setup.interfaceAll = true
    setup.healthBarChampions = true
    setup.healthBarMinions = true
    setup.healthBarStructures = true
    setup.healthBarWards = true
    setup.interfaceNeutralTimers = true
    setup.interfaceKillCallouts = false
    setup.interfaceTimeline = false
    setup.interfaceScoreboard = true

    fetch(uri, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(setup),
      redirect: 'follow',
      ...fetchOption
    })
  }

  private getPlayback () {
    if (!this.menuItem.submenu?.items[3].checked) return

    if (this.playbackInterval) {
      clearInterval(this.playbackInterval)
    }

    this.server.subscribe(this.namespace, this.type, (data) => {
      console.log(data)
      this.playbackData = {
        savedAt: data.savedAt,
        time: data.time
      }
    })

    this.isSynced = true
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

    this.isSynced = false
    Sender.emit(this.id, 0)

    if (this.menuItem.submenu) {
      this.menuItem.submenu.items[0].checked = false
    }

    this.server.unsubscribe('module-league-caster-cockpit', 'show-gold')

    globalShortcut.unregister('CommandOrControl+J')
    globalShortcut.unregister('CommandOrControl+K')
    globalShortcut.unregister('CommandOrControl+L')
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
      const saveData = JSON.stringify({
        playback: this.playbackData,
        render: this.renderData
      }, null, 2)
      const savePath = saveDialog.filePath.toString()
      await writeFile(savePath, saveData)
    }
  }
}