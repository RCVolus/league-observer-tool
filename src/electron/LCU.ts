import { ipcMain, BrowserWindow, Menu, dialog } from 'electron';
import { authenticate, connect, Credentials, LeagueClient, LeagueWebSocket, request, RequestOptions } from 'league-connect'
import type { LCUResponse } from '../../types/LCUResponse'
import { ProdModule } from './ProdModule';

export class LCU {
  public credentials? : Credentials
  public leagueClient? : LeagueClient
  public mainWindow? : BrowserWindow
  public menu? : Menu
  private msg : LCUResponse = {
    status: "pending",
    type: "connecting"
  }
  public modules : Map<string, ProdModule> = new Map()
  private ws? : LeagueWebSocket

  constructor () {
    ipcMain.on('lcu-connection-start', () => {
      this.connect()
    })

    ipcMain.on('lcu-connection-stop', () => {
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

  private async handleConnection (credentials: Credentials) {
    if (!this.mainWindow || !this.menu) return
    this.mainWindow?.webContents.send('lcu-connection', 'handleConnection')
    
    this.leagueClient = new LeagueClient(credentials);
    const ws = await connect(credentials);
    this.ws = ws

    const champSelect = new ProdModule(
      ws,
      this.mainWindow,
      this.menu,
      "champ-select",
      "/lol-champ-select/v1/session"
    )
    this.modules.set("champ-select", champSelect)

    const endOfGame = new ProdModule(
      ws,
      this.mainWindow,
      this.menu,
      "end-of-game",
      "/lol-end-of-game/v1/eog-stats-block"
    )
    this.modules.set("end-of-game", endOfGame)

    this.leagueClient.on('connect', (newCredentials) => {
      this.credentials = newCredentials
      this.msg.status = "done"
      this.msg.type = 'connecting'
      this.msg.data = true
      this.mainWindow?.webContents.send('lcu-connection', this.msg)
      if (this.menu) {
        this.menu.getMenuItemById('connect').enabled = false
        this.menu.getMenuItemById('disconnect').enabled = true
      }
    })
    
    this.leagueClient.on('disconnect', () => {
      this.credentials = undefined
      this.msg.status = "done"
      this.msg.type = 'disconnecting'
      this.msg.data = undefined
      this.mainWindow?.webContents.send('lcu-connection', this.msg)
      if (this.menu) {
        this.menu.getMenuItemById('connect').enabled = true
        this.menu.getMenuItemById('disconnect').enabled = false
      }
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

      this.msg.status = "done"
      this.msg.data = true
    } catch (e) {
      this.mainWindow?.webContents.send('console', e)
      
      this.msg.status = "done"
      this.mainWindow?.webContents.send('lcu-connection', this.msg)
    } finally {
      this.mainWindow?.webContents.send('lcu-connection', this.msg)
    }
  }
}