import { Alert } from './Alert'
const { ipcRenderer } = window.require("electron");
import type { Summoner as SummonerType } from '../../../types/Summoner/Summoner'
import type { LCUResponse } from '../../../types/LCUResponse'
import { writable, Writable } from "svelte/store";
import type { RequestOptions } from 'league-connect';

class LCUConnector {
  public isConnected : Writable<boolean> = writable(false)
  public summoner : Writable<SummonerType | undefined> = writable(undefined)
  public isPending : Writable<boolean> = writable(false)

  constructor () {
    this.listenForConnection()
  }

  private listenForConnection () {
    ipcRenderer.on('lcu-connection', (_e: any, lcuConnection : LCUResponse) => {
      if (lcuConnection.status == "pending") {
        this.isPending.set(true)
        return
      }
      else this.isPending.set(false)
      
      if (!lcuConnection.data) {
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
    ipcRenderer.send('lcu-connection-start')
  }

  public disconnect () { 
    ipcRenderer.send('lcu-connection-stop')
  }

  public async getLoggedInSummoner () {
    const summoner = await this.makeRequest<SummonerType>({
      method: "GET",
      url: "/lol-summoner/v1/current-summoner"
    })

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

  private async makeRequest <R = any> (options: RequestOptions) : Promise<R> {
    this.isPending.set(true)
    const res = await ipcRenderer.sendSync('lcu-request', options) as LCUResponse<R>;
    
    if (res.data) {
      this.isPending.set(false)
      return res.data as R
    } else {
      this.isPending.set(false)
      throw new Error
    }
  }
}

export const LCU = new LCUConnector();