import { dialog, app, ipcMain } from 'electron'
import { join } from 'path'
import { execFile } from 'child_process'
import { promisify } from 'util'
import log from 'electron-log';
import { store } from '../index'

const logger = log.scope('RoflPlayer')

const asyncExec = promisify(execFile)

export class Rofl {
  public roflPath: string = ''
  public gamePath: string

  constructor() {
    this.gamePath = store.get('league-install-path')

    ipcMain.handle('rofl-start', async () => {
      const path = await this.findRoflPath()
      this.execRofl()
      return path
    })
  }

  async findRoflPath (): Promise<string> {
    const file = await dialog.showOpenDialog({
      defaultPath: join(app.getPath("documents"), 'League of Legends', 'Replays'),
      filters: [
        { name: 'ROFL Files', extensions: ['rofl'] }
      ],
      properties: [
        'openFile'
      ]
    })

    if (file.canceled) return this.roflPath

    return this.roflPath = file.filePaths[0]
  }

  execRofl() {
    try {
      const cwd = join(this.gamePath, 'Game')
      const execPath = join(cwd, 'League of Legends.exe')

      asyncExec(execPath, [this.roflPath, `-GameBaseDir=${this.gamePath}`], {cwd})
    } catch (error) {
      logger.error(error)
    }
  }
}