import { EventResponse, LeagueWebSocket } from 'league-connect'
import { BrowserWindow, ipcMain, Menu } from 'electron';

export class ChampSelect {
  constructor (
    private ws: LeagueWebSocket,
    private mainWindow : BrowserWindow,
    private menu : Menu
  ) {
    ipcMain.on('lcu-champselect-start', () => {
      this.connect()
    })
    ipcMain.on('lcu-champselect-stop', () =>{
      this.disconnect()
    })
    this.menu.getMenuItemById('champselect').enabled = true
  }

  public connect () {
    this.ws.subscribe('/lol-champ-select/v1/session', (data: any, event: EventResponse) => this.handleData(data, event))
    this.mainWindow.webContents.send('lcu-champselect', true)
    if (this.menu) {
      this.menu.getMenuItemById('champselect').checked = true
    }
  }

  private async handleData(data: any, event: EventResponse) {
    this.mainWindow.webContents.send('console', {data, event})
  }

  public disconnect () {
    this.ws.unsubscribe('/lol-champ-select/v1/session');
    this.mainWindow.webContents.send('lcu-champselect', false)
    this.menu.getMenuItemById('champselect').checked = false
  }
}