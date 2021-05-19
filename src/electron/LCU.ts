import { ipcMain, BrowserWindow, Menu, dialog } from 'electron';
import { authenticate, Credentials, LeagueClient } from 'league-connect'
import type { LCUConnection } from '../../types/LCUConnection'

export class LCU {
  public credentials? : Credentials
  public leagueClient? : LeagueClient
  public mainWindow? : BrowserWindow
  public menu? : Menu
  private msg : LCUConnection = {
    status: "pending",
    type: "connecting"
  }

  constructor () {
    ipcMain.on('lcu-start-connection', () => {
      this.connect()
    })

    ipcMain.on('lcu-stop-connection', () => {
      this.disconnect()
    })
    this.mainWindow?.webContents.send('console', this.menu)
  }

  private handleConnection (credentials: Credentials) {
    this.msg.status = "done"
    this.msg.credentials = credentials

    this.mainWindow?.webContents.send('lcu-connection', this.msg)
    this.leagueClient = new LeagueClient(credentials);

    this.leagueClient.on('connect', (newCredentials) => {
      this.credentials = newCredentials
      this.msg.status = "done"
      this.msg.type = 'connecting'
      this.msg.credentials = undefined
      this.mainWindow?.webContents.send('lcu-connection', this.msg)
    })
    
    this.leagueClient.on('disconnect', () => {
      this.credentials = undefined
      this.msg.status = "done"
      this.msg.type = 'disconnecting'
      this.msg.credentials = undefined
      this.mainWindow?.webContents.send('lcu-connection', this.msg)
    })

    this.leagueClient.start()

    if (this.menu) {
      this.menu.getMenuItemById('connect').enabled = false
      this.menu.getMenuItemById('disconnect').enabled = true
    }
  }

  public async disconnect () {
    if (!this.leagueClient) return
    if (!this.mainWindow) return

    let options = {
      buttons: ["Yes","Cancel"],
      type: "question",
      message: "Do you really want to disconnect?"
    }
    const choice = dialog.showMessageBoxSync(this.mainWindow, options)
    if (choice == 1) return

    this.leagueClient.stop()
    this.credentials = undefined

    this.msg.status = "done"
    this.msg.type = 'disconnecting'
    this.msg.credentials = undefined

    this.mainWindow?.webContents.send('lcu-connection', this.msg)

    if (this.menu) {
      this.menu.getMenuItemById('connect').enabled = true
      this.menu.getMenuItemById('disconnect').enabled = false
    }
  }

  public async connect () {
    this.msg.status = "pending"
    this.msg.type = 'connecting'
    this.msg.credentials = undefined

    this.mainWindow?.webContents.send('lcu-connection', this.msg)

    try {
      const credentials = await authenticate();
      this.credentials = credentials
      this.handleConnection(credentials);
    } catch (e) {
      this.mainWindow?.webContents.send('console', e)
      
      this.msg.status = "done"
      this.mainWindow?.webContents.send('lcu-connection', this.msg)
    }
  }
}