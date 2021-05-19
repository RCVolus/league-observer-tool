import { EventResponse, LeagueWebSocket } from 'league-connect'
import { BrowserWindow, ipcMain } from 'electron';

export class ChampSelect {
  constructor (private ws: LeagueWebSocket, private mainWindow : BrowserWindow) {
    ipcMain.on('lcu-champselect-start', () => {
      this.connect()
    })
    ipcMain.on('lcu-champselect-stop', () =>{
      this.disconnect()
    })
  }

  public connect () {
    this.ws.subscribe('/lol-champ-select/v1/session', (data: any, event: EventResponse) => this.handleData(data, event))
    this.mainWindow.webContents.send('lcu-champselect', true)
  }

  private async handleData(data: any, event: EventResponse) {
    this.mainWindow.webContents.send('console', {data, event})
  }

  public disconnect () {
    this.ws.unsubscribe('/lol-champ-select/v1/session');
    this.mainWindow.webContents.send('lcu-champselect', false)
  }
}