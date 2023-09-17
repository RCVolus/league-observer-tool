import { join } from 'path'
import { readFile, writeFile } from 'fs/promises'
import ini from 'ini'
import { Setup } from "./Setup";
import { store } from '../index'
import fileExists from '../helper/fileExists';
import { DisplayError } from '../../types/DisplayError';
import { Sender } from '../helper/Sender';
import log from 'electron-log';

const logger = log.create('GameConfig')
logger.scope('GameConfig')

export class GameConfig extends Setup {
  config: {
    [key: string]: {
      [key: string]: string
    }
  } = {
      'General': {
        'EnableReplayApi': '1'
      },
      'LiveEvents': {
        'Enable': '1',
        'Port': store.get('live-events-port').toString()
      },
      'Replay': {
        'MouseHighlightEnable': '0',
        'SelectedHighlightEnable': '0',
        'SelectedHealthbarHighlightEnable': '1'
      },
      'Spectator': {
        'eSportsNeutralTimers': '1'
      }
    }

  public async checkConfig(): Promise<boolean> {
    const configPath = join(this.configFolderPath, 'game.cfg')

    const exists = await fileExists(configPath)
    if (!exists) {
      this.emitErrorMessage('Game', 'missing')
    }

    const file = await readFile(configPath, 'utf-8')
    const config = ini.parse(file)

    for (const group in this.config) {
      if (config[group] === undefined) {
        this.emitErrorMessage('Game', 'incomplete')
        return this.setupComplete
      }

      for (const option in this.config[group]) {
        if (config[group][option] === undefined) {
          this.emitErrorMessage('Game', 'incomplete')
          this.setupComplete = false
          return this.setupComplete
        }

        if (config[group][option] !== this.config[group][option]) {
          this.emitErrorMessage('Game', 'wrong')
          this.setupComplete = false
          return this.setupComplete
        }
      }
    }

    this.setupComplete = true
    return this.setupComplete
  }

  public async setupConfig(): Promise<void> {
    const configPath = join(this.configFolderPath, 'game.cfg')

    const exists = await fileExists(configPath)
    if (!exists) {
      this.emitErrorMessage('Game', 'missing')
    }

    const file = await readFile(configPath, 'utf-8')
    const config = ini.parse(file)

    for (const group in this.config) {
      for (const option in this.config[group]) {
        config[group][option] = this.config[group][option]
      }
    }

    try {
      await writeFile(configPath, ini.stringify(config))
      this.setupComplete = true
    } catch (error) {
      logger.error(error)

      Sender.emit('error', {
        color: "danger",
        text: `The Game config could not be updated! Error: ${error}`
      } as DisplayError)
    }
  }
}