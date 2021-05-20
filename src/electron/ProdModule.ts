import { EventResponse, LeagueWebSocket } from 'league-connect'
import { BrowserWindow, ipcMain, Menu, dialog, app } from 'electron';
import * as path from "path";
import * as fs from "fs";

export class ProdModule {
  private data : Array<any> = []

  constructor (
    private ws: LeagueWebSocket,
    private mainWindow : BrowserWindow,
    private menu : Menu,
    private name: string,
    private lcuURI: string
  ) {
    ipcMain.on(`lcu-${name}-start`, () => {
      this.connect()
    })
    ipcMain.on(`lcu-${name}-stop`, () =>{
      this.disconnect()
    })
    ipcMain.on(`lcu-${name}-save`, () => {
      this.saveData()
    })

    this.menu.getMenuItemById(name).enabled = true
  }

  public connect () {
    this.ws.subscribe(this.lcuURI, (data: any, event: EventResponse) => this.handleData(data, event))
    this.mainWindow.webContents.send(`lcu-${this.name}`, true)
    if (this.menu) {
      this.menu.getMenuItemById(this.name).checked = true
    }
  }

  private async handleData(data: any, event: EventResponse) {
    this.data.push({data, event})
    this.mainWindow.webContents.send('console', {data, event})
  }

  public disconnect () {
    this.ws.unsubscribe(this.lcuURI);
    this.mainWindow.webContents.send(`lcu-${this.name}`, false)
    this.menu.getMenuItemById(this.name).checked = false
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
      const saveData = JSON.stringify(this.data)
      const savePath = saveDialog.filePath.toString()
      fs.writeFile(savePath, saveData, (err) => {
          if (err) throw err;
          this.mainWindow.webContents.send('console', `Saved at ${savePath}`)
      });
    }
  }
}