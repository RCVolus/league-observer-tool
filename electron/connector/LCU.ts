import { ipcMain } from 'electron';
import { authenticate, connect, Credentials, EventCallback, LeagueClient, LeagueWebSocket, request, RequestOptions } from 'league-connect'
import type { DisplayError } from '../../types/DisplayError';
import { Sender } from '../helper/Sender';
import log from 'electron-log';

export class LCU {
  public credentials? : Credentials
  public leagueClient? : LeagueClient
  private lolWs? : LeagueWebSocket
  private timeout ? : NodeJS.Timeout
  private isClosing = false
  private InitConnection = true
  private logger : log.ElectronLog

  constructor () {
    this.logger = log.create('LCU')
    this.logger.scope('LCU')

    ipcMain.handle('lcu-connection-start', () => {
      this.connect()
    })
  }

  public async request (arg: RequestOptions) : Promise<any> {
    if (!this.credentials) return

    try {
      const res = await request(arg, this.credentials)

      if (res.ok) {
        const json = await res.json();
        return json
      } else {
        return undefined
      }
    } catch (e) {
      this.logger.error(e)
      Sender.emit('error', {
        color: "danger",
        text: e.message
      } as DisplayError)
    }
  }

  private handleConnection () {
    if (!this.credentials) return

    this.leagueClient = new LeagueClient(this.credentials);

    this.leagueClient.on('connect', (newCredentials) => {
      this.credentials = newCredentials
      Sender.emit('lcu-connection', true)
    })
    
    this.leagueClient.on('disconnect', () => {
      this.credentials = undefined
      Sender.emit('lcu-connection', false)
      if (!this.isClosing) {
        this.timeout = setTimeout(() => {this.connect()}, 5000)
      }
    })

    this.leagueClient.start()
  }

  private async handleWebSockets() {
    if (!this.credentials) return

    this.lolWs = await connect(this.credentials);
    
    this.lolWs.onopen = () => {
      this.isClosing = false
      this.InitConnection = false
      Sender.emit('lcu-connection', true)
    }

    this.lolWs.onerror = e => {
      this.logger.error(e)
      Sender.emit('error', {
        color: "danger",
        text: 'There was an error on the connection to the League Client',
        timeout: 5500
      } as DisplayError)

      Sender.emit('lcu-connection', false)
    }

    this.lolWs.onclose = () => {
      Sender.emit('lcu-connection', false)
      
      if (!this.isClosing && !this.InitConnection) {
        this.timeout = setTimeout(() => {this.connect()}, 5000)
      }
    }
  }

  /**
   * subscribe
   */
  public subscribe(path: string, effect: EventCallback<any>) : void {
    this.lolWs?.subscribe(path, effect)
  }

  /**
   * unsubscribe
   */
  public unsubscribe(path: string) : void {
    this.lolWs?.unsubscribe(path)
  }

  public disconnect () : void {
    this.leagueClient?.stop()
    this.credentials = undefined

    this.isClosing = true
    this.InitConnection = true
    this.lolWs?.close()
    
    if (this.timeout) {
      clearTimeout(this.timeout)
    }

    Sender.emit('lcu-connection', false)
  }

  public async connect () : Promise<void> {
    try {
      const credentials = await authenticate();
      this.credentials = credentials

      this.handleConnection();
      this.handleWebSockets()
    } catch (e) {
      this.logger.error(e)
      Sender.emit('error', {
        color: "danger",
        text: 'League Client process could not be found',
        timeout: 5500
      } as DisplayError)

      if (!this.isClosing) {
        this.timeout = setTimeout(() => {this.connect()}, 5000)
      }
      
      Sender.emit('lcu-connection', false)
    }
  }
}