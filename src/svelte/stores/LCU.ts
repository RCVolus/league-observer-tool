import { Alert } from './Alert'
const { ipcRenderer } = window.require("electron");
import type { Credentials } from 'league-connect'
import type { Summoner as SummonerType } from '../../../types/Summoner/Summoner'
import { writable, Writable } from "svelte/store";

class LcuConnector {
  public isConnected : Writable<boolean> = writable(false)
  public summoner : Writable<SummonerType | undefined> = writable(undefined)
  private credentials : Credentials | undefined = undefined

  public connect () {
    ipcRenderer.send('lcu-start-connect')

    ipcRenderer.on('lcu-connection', (_event: any, credentials : Credentials | undefined) => {
      this.credentials = credentials
      
      if (!credentials) {
        Alert.set({
          show: true,
          color: "danger",
          heading: "LCU Connection Failed",
          text: "The connection to the LCU client failed pleas try again"
        })
      } else {
        this.getLoggedInSummoner()
      }
    })
  }

  public disconnect () { 
    ipcRenderer.send('lcu-stop-connect')
    this.credentials = undefined
    this.isConnected.set(false)
    this.summoner.set(undefined)
  }

  public async getLoggedInSummoner () {
    const summoner = await this.makeRequest<undefined, SummonerType | undefined>("GET", "/lol-summoner/v1/current-summoner")

    if (!summoner) {
      Alert.set({
        show: true,
        color: "danger",
        heading: "No Summoner logged in",
        text: "Please log in to continue"
      })
    } else {
      Alert.set({
        show: true,
        color: "success",
        heading: "LCU connected",
        text: "The connection was established"
      })
      this.summoner.set(summoner)
      this.isConnected.set(true)
    }
  }

  private async makeRequest <B, R> (
    method : 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    endpoint : string,
    data?: B
  ) : Promise<R> {
    if (!this.credentials) return Promise.reject()

    let body = undefined
    if (data && (method !== 'GET' && method !== 'DELETE')) {
      body = JSON.stringify(data)
    }

    const res = await fetch(`https://127.0.0.1:${this.credentials.port}${endpoint}`, {
        body: body,
        method: method,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Basic ' + Buffer.from('riot:' + this.credentials.password).toString('base64')
        }
    })

    const json = await res.json()
    console.log(JSON.stringify(json))

    if (res.ok) {
      return json
    } else {
      throw new Error(json)
    }
    
  }
}

export const LCU = new LcuConnector();



/* class LcuConnector {
  private handlers : Array<{uri: string, type: string, action: () => void}> = []

  constructor(private credentials : Credentials) {}

  async makeRequest<T = any>(method : 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE', endpoint : string, data?: T) {
    let body = undefined
    if (data && (method !== 'GET' && method !== 'DELETE')) body = JSON.stringify(data)

    const res = await fetch(`https://127.0.0.1:${this.credentials.port}${endpoint}`, {
        body: body,
        method: method,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Basic ' + Buffer.from('riot:' + this.credentials.password).toString('base64')
        }
    })

    const json = await res.json()
    console.log(json)
    return json
  }

  listen() {
    document.cookie = 'Authorization=Basic ' + btoa(`riot:${this.credentials.password}`);
    let wsUrl = `wss://riot:${this.credentials.password}@127.0.0.1:${this.credentials.port}/`
    const ws = new WebSocket(wsUrl, 'wamp')
    ws.onmessage = function (msg) {
      console.log(msg)
        if (msg.('RiotRemoting"]')) return

        const [, , data] = JSON.parse(msg)

        this.handlers.forEach(h => {
            if ((data.uri.startsWith(h.uri) || h.uri === '*') && (data.eventType === h.type || h.type === '*')) {
                h.action(data.uri, data.eventType, data.data)
            }
        })
    }

    ws.onopen = function () { ws.send('[5,"OnJsonApiEvent"]') }
    ws.onerror = function (e) {console.log(e)}
  }

  addHandler(uri: string, type: string, action: () => void) {
    let newHandler = { uri, type, action }
    this.handlers.push(newHandler)
    return newHandler
  }

} */