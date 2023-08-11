import { ipcMain } from 'electron';
import { authenticate, connect, Credentials, EventCallback, LeagueClient, LeagueWebSocket, request, RequestOptions } from 'league-connect'
import type { DisplayError } from '../../types/DisplayError';
import { Sender } from '../helper/Sender';
import log from 'electron-log';
import { store } from '../index'

export class LCU {
  public credentials? : Credentials
  public leagueClient? : LeagueClient
  private lolWs? : LeagueWebSocket
  private timeout ? : NodeJS.Timeout
  private isClosing = false
  private isConnected = false
  private InitConnection = true
  private logger : log.ElectronLog
  private connectionHandlers: Array<() => void> = []

  constructor () {
    this.logger = log.create('LCU')
    this.logger.scope('LCU')

    ipcMain.handle('lcu-connection-start', () => {
      this.connect()
    })
  }

  public async request(arg: RequestOptions) : Promise<any> {
    if (!this.credentials) return

    try {
      const res = await request(arg, this.credentials)

      if (res.ok) {
        const json = await res.json();
        return json
      } else {
        return undefined
      }
    } catch (e: any) {
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

    this.leagueClient.on('connect', async (newCredentials) => {
      this.credentials = newCredentials
      Sender.emit('lcu-connection', true)
    })
    
    this.leagueClient.on('disconnect', () => {
      this.credentials = undefined
      Sender.emit('lcu-connection', false)
      this.isConnected = false

      if (!this.isClosing) {
        this.timeout = setTimeout(() => {this.connect()}, 5000)
      }
    })

    this.leagueClient.start()
  }

  async getInstallPath (): Promise<string> {
    const res = await this.request({
      method: 'GET',
      url: '/data-store/v1/install-dir'
    })
    return res
  }

  public onConnected(handler: () => void): void {
    if (this.isConnected) {
      handler()
    } else {
      this.connectionHandlers.push(handler)
    }
  }

  private _onConnected(): void {
    this.connectionHandlers.forEach(handler => {
      handler()
    })
  }

  private async handleWebSockets() {
    if (!this.credentials) return

    this.lolWs = await connect(this.credentials);
    
    this.lolWs.onopen = async () => {
      this.isClosing = false
      this.InitConnection = false
      this.isConnected = true
      Sender.emit('lcu-connection', true)

      this._onConnected()

      if (!store.has('league-install-path') || store.get('league-install-path') === undefined || store.get('league-install-path') === '') {
        const path = await this.getInstallPath()
        console.log(path)
        store.set('league-install-path', path)
      }
    }

    this.lolWs.onerror = e => {
      this.logger.error(e)
      Sender.emit('error', {
        color: "danger",
        text: 'There was an error on the connection to the League Client',
        timeout: 5500
      } as DisplayError)

      Sender.emit('lcu-connection', false)
      this.isConnected = true
    }

    this.lolWs.onclose = () => {
      Sender.emit('lcu-connection', false)
      this.isConnected = true
      
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
    this.isConnected = true
    this.lolWs?.close()
    
    if (this.timeout) {
      clearTimeout(this.timeout)
    }

    Sender.emit('lcu-connection', false)
  }

  public async connect () : Promise<void> {
    try {
      const credentials = await authenticate()
      this.credentials = credentials
      this.credentials.password = credentials.password.replace('--app-port', '')

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