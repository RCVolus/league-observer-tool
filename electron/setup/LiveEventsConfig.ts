import { join } from 'path'
import { readFile, writeFile } from 'fs/promises'
import { Setup } from "./Setup";
import fileExists from '../helper/fileExists';
import { Sender } from '../helper/Sender';
import { DisplayError } from '../../types/DisplayError';
import log from 'electron-log';

const logger = log.scope('LiveEventsConfig')

export class LiveEventsConfig extends Setup {
  static lines: string[] = [
    'OnKillDragon_Spectator',
    'OnKillRiftHerald_Spectator',
    'OnKillWorm_Spectator',
    'OnTurretPlateDestroyed',
    'OnDragonSoulGiven'
  ]

  public async checkConfig(): Promise<boolean> {
    const configPath = join(this.configFolderPath, 'LiveEvents.ini')

    const exists = await fileExists(configPath)
    if (!exists) {
      this.emitErrorMessage('Live Events', 'missing')
      return this.setupComplete
    }

    const file = await readFile(configPath, 'utf-8')
    const fileLines = file.split('\r\n')

    if (LiveEventsConfig.lines.every((u) => fileLines.includes(u))) {
      this.setupComplete = true
    } else {
      this.emitErrorMessage('Live Events', 'incomplete')
      this.setupComplete = false
    }

    return this.setupComplete
  }

  public async setupConfig(): Promise<void> {
    const configPath = join(this.configFolderPath, 'LiveEvents.ini')

    let fileLines : string[] = []

    const exists = await fileExists(configPath)
    if (exists) {
      const file = await readFile(configPath, 'utf-8')
      fileLines = file.split('\r\n')
    }

    for (const line of LiveEventsConfig.lines) {
      if (fileLines.includes(line)) continue
      fileLines.push(line)
    }

    try {
      await writeFile(configPath, fileLines.join('\r\n'))
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