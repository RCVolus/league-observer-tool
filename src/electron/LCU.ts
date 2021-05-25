import { ipcMain } from 'electron';
import { authenticate, connect, Credentials, EventCallback, LeagueClient, LeagueWebSocket, request, RequestOptions } from 'league-connect'
import { DisplayError } from '../../types/DisplayError';
import { Sender } from './Sender';

export class LCU {
  public credentials? : Credentials
  public leagueClient? : LeagueClient
  private lolWs? : LeagueWebSocket
  private timeout ? : ReturnType<typeof setTimeout>
  private isClosing : boolean = false
  private InitConnection : boolean = true

  constructor () {
    ipcMain.on('lcu-connection-start', () => {
      this.connect()
    })
    ipcMain.on('lcu-connection-stop', () => {
      this.disconnect()
    })

    this.handleRequests()
  }

  public async handleRequests () {
    ipcMain.on('lcu-request', async (e, arg: RequestOptions) => {      
      e.returnValue = await this.request(arg)
    })
  }

  public async request (arg: RequestOptions) {
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
  public subscribe(path: string, effect: EventCallback<any>) {
    return this.lolWs?.subscribe(path, effect)
  }

  /**
   * unsubscribe
   */
   public unsubscribe(path: string) {
    return this.lolWs?.unsubscribe(path)
  }

  public async disconnect () {
    let options = {
      buttons: ["Yes","Cancel"],
      type: "question",
      message: "Do you really want to disconnect?"
    }
    const choice = Sender.showMessageBoxSync(options)
    if (choice == 1) return

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

  public async connect () {
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