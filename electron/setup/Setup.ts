import { join } from 'path'
import { store } from '../index'
import { Sender } from '../helper/Sender';
import { DisplayError } from '../../types/DisplayError';
import { ipcMain } from 'electron';

export class Setup {
  setupComplete = false
  configFolderPath = ''
  leagueInstallPath = ''

  constructor() {
    this.leagueInstallPath = store.get('league-install-path')
    this.configFolderPath = join(this.leagueInstallPath, 'Config')

    ipcMain.on('config-auto-setup', async () => {
      await this.setupConfig()
    })
  }

  protected emitErrorMessage(config: 'Game' | 'Live Events', type: 'missing' | 'incomplete' | 'wrong'): void {
    Sender.emit('error', {
      color: "danger",
      text: `The ${config} config is ${type}! Go to the settings page to automatically fix that or adjust it manually to insure full functionality`,
      timeout: 10_000
    } as DisplayError)
  }

  public async checkConfig(): Promise<boolean> { return false }
  public async setupConfig(): Promise<void> { }
}