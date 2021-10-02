import { ipcMain } from 'electron';
import { authenticate, connect, Credentials, EventCallback, LeagueClient, LeagueWebSocket, request, RequestOptions } from 'league-connect'
import type { DisplayError } from '../../types/DisplayError';
import { Sender } from '../helper/Sender';

export class LCU {
  public credentials? : Credentials
  public leagueClient? : LeagueClient
  private lolWs? : LeagueWebSocket
  private timeout ? : NodeJS.Timeout
  private isClosing = false
  private InitConnection = true

  constructor () {
    ipcMain.on('lcu-connection-start', () => {
      this.connect()
    })

    this.handleRequests()
  }

  private async handleRequests () {
    ipcMain.on('lcu-request', async (e, arg: RequestOptions) => {      
      e.returnValue = await this.request(arg)
    })
  }

  public async request (arg: RequestOptions) : Promise<any> {
    if (!this.credentials) {
      Sender.send('error', {
        color: "warning",
        text: "not connected"
      } as DisplayError)
    }

    try {
      const req = await request(arg, this.credentials) 
      const json = await req.json();
      return json
    } catch (e) {
      Sender.send('console', e)
      Sender.send('error', {
        color: "danger",
        text: e.message
      } as DisplayError)
      throw e
    }
  }

  private handleConnection (credentials: Credentials) {
    this.leagueClient = new LeagueClient(credentials);

    this.leagueClient.on('connect', (newCredentials) => {
      this.credentials = newCredentials
      Sender.send('lcu-connection', true)
    })
    
    this.leagueClient.on('disconnect', () => {
      this.credentials = undefined
      Sender.send('lcu-connection', false)
    })

    this.leagueClient.start()
  }

  private async handleWebSockets(credentials: Credentials) {
    this.lolWs = await connect(credentials);
    
    this.lolWs.onopen = () => {
      this.isClosing = false
      this.InitConnection = false
      Sender.send('lcu-connection', true)
    }

    this.lolWs.onerror = e => {
      Sender.send('error', {
        color: "danger",
        text: e.message,
      } as DisplayError)
      Sender.send('lcu-connection', false)
    }

    this.lolWs.onclose = () => {
      Sender.send('lcu-connection', false)
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

    Sender.send('lcu-connection', false)
  }

  public async connect () : Promise<void> {
    try {
      const credentials = await authenticate();
      this.credentials = credentials
      this.handleConnection(credentials);

      this.handleWebSockets(credentials)
    } catch (e) {
      Sender.send('console', e)
      Sender.send('error', {
        color: "danger",
        text: e.message
      } as DisplayError)
      Sender.send('lcu-connection', false)
    }
  }
}