import { Alert } from './Alert'
const { ipcRenderer } = window.require("electron");
import type { Credentials } from 'league-connect'
import type { Summoner as SummonerType } from '../../../types/Summoner/Summoner'
import type { LCUConnection } from '../../../types/LCUConnection'
import { writable, Writable } from "svelte/store";

class LcuConnector {
  public isConnected : Writable<boolean> = writable(false)
  public summoner : Writable<SummonerType | undefined> = writable(undefined)
  public isPending : Writable<boolean> = writable(false)
  private credentials : Credentials | undefined = undefined

  constructor () {
    this.listenForConnection()
  }

  private listenForConnection () {
    ipcRenderer.on('lcu-connection', (_event: any, lcuConnection : LCUConnection) => {
      if (lcuConnection.status == "pending") {
        this.isPending.set(true)
        return
      }
      else this.isPending.set(false)

      this.credentials = lcuConnection.credentials
      
      if (!lcuConnection.credentials) {
        this.isConnected.set(false)
        this.summoner.set(undefined)

        if (lcuConnection.type == "connecting") {
          Alert.set({
            show: true,
            color: "danger",
            heading: "LCU Connection Failed",
            text: "The connection to the LCU client failed pleas try again"
          })
        }
      } else {
        this.getLoggedInSummoner()
      }
    })
  }

  public connect () {
    ipcRenderer.send('lcu-start-connection')
  }

  public disconnect () { 
    ipcRenderer.send('lcu-stop-connection')
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
    this.isPending.set(true)

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
    this.isPending.set(false)

    if (res.ok) {
      return json
    } else {
      throw new Error(json)
    }
    
  }
}

export const LCU = new LcuConnector();