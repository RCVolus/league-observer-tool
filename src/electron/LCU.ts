import { ipcMain, BrowserWindow, Menu, dialog } from 'electron';
import { authenticate, Credentials, LeagueClient, request, RequestOptions } from 'league-connect'
import type { LCUResponse } from '../../types/LCUResponse'

export class LCU {
  public credentials? : Credentials
  public leagueClient? : LeagueClient
  public mainWindow? : BrowserWindow
  public menu? : Menu
  private msg : LCUResponse = {
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

    this.handleRequests()
  }

  public async handleRequests () {
    ipcMain.on('lcu-request', async (e, arg: RequestOptions) => {
      this.msg.type = "response"
      
      if (!this.credentials) {
        this.msg.status = "done"
        this.msg.data = undefined
        return e.returnValue = this.msg
      }

      try {
        const req = await request(arg, this.credentials) 
        const json = await req.json();
        this.msg.status = "done"
        this.msg.data = json
      } catch (e) {
        this.msg.status = "done"
        this.mainWindow?.webContents.send('console', e)
      } finally {
        e.returnValue = this.msg
      }
    })
  }

  private handleConnection (credentials: Credentials) {
    this.msg.status = "done"
    this.msg.data = true

    this.mainWindow?.webContents.send('lcu-connection', this.msg)
    this.leagueClient = new LeagueClient(credentials);

    this.leagueClient.on('connect', (newCredentials) => {
      this.credentials = newCredentials
      this.msg.status = "done"
      this.msg.type = 'connecting'
      this.msg.data = true
      this.mainWindow?.webContents.send('lcu-connection', this.msg)
    })
    
    this.leagueClient.on('disconnect', () => {
      this.credentials = undefined
      this.msg.status = "done"
      this.msg.type = 'disconnecting'
      this.msg.data = undefined
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
    this.msg.data = undefined

    this.mainWindow?.webContents.send('lcu-connection', this.msg)

    if (this.menu) {
      this.menu.getMenuItemById('connect').enabled = true
      this.menu.getMenuItemById('disconnect').enabled = false
    }
  }

  public async connect () {
    this.msg.status = "pending"
    this.msg.type = 'connecting'
    this.msg.data = undefined

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