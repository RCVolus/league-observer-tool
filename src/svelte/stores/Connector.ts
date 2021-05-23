import { AlertStore } from './Alert'
const { ipcRenderer } = window.require("electron");
import type { Summoner as SummonerType } from '../../../types/Summoner/Summoner'
import type { Response } from '../../../types/Response'
import { writable, Writable, derived } from "svelte/store";
import type { RequestOptions } from 'league-connect';

class Connector {
  public lcuConnected : Writable<boolean> = writable(false)
  public lcuPending : Writable<boolean> = writable(false)
  public serverConnected : Writable<boolean> = writable(false)
  public severPending : Writable<boolean> = writable(false)
  public summoner : Writable<SummonerType | undefined> = writable(undefined)

  constructor () {
    ipcRenderer.on('lcu-connection', (_e: any, state : boolean) => {
      if (state) {
        this.getLoggedInSummoner()
      } else {
        this.lcuPending.set(false)
        this.lcuConnected.set(false)
        this.summoner.set(undefined)
      }
    })
    ipcRenderer.on('server-connection', (_e: any, state : boolean) => {
      this.severPending.set(false)
      this.serverConnected.set(state)
    })
  }

  get isConnected() {
    // Use derived to access writable values and export as readonly
    return derived(
        [this.lcuConnected, this.serverConnected],
        ([$lcuConnected, $serverConnected]) => {
            return $lcuConnected && $serverConnected
        }
    )
  }

  get isPending() {
    // Use derived to access writable values and export as readonly
    return derived(
        [this.lcuPending, this.severPending],
        ([$lcuPending, $severPending]) => {
            return $lcuPending || $severPending
        }
    )
  }

  public connect () {
    this.lcuPending.set(true)
    this.severPending.set(true)
    ipcRenderer.send('lcu-connection-start')
    ipcRenderer.send('server-connection-start')
  }

  public disconnect () {
    ipcRenderer.send('lcu-connection-stop')
    ipcRenderer.send('server-connection-stop')
  }

  public async getLoggedInSummoner () {
    const summoner = await this.makeRequest<SummonerType>({
      method: "GET",
      url: "/lol-summoner/v1/current-summoner"
    })

    if (!summoner) {
      AlertStore.Alert.set({
        color: "danger",
        text: "No Summoner logged in",
      })
    } else {
      AlertStore.Alert.set({
        color: "success",
        text: "LCU connected",
      })
      this.summoner.set(summoner)
      this.lcuPending.set(false)
      this.lcuConnected.set(true)
    }
  }

  private async makeRequest <R = any> (options: RequestOptions) : Promise<R> {
    this.lcuPending.set(true)
    const res = await ipcRenderer.sendSync('lcu-request', options) as R;
    
    if (res) {
      this.lcuPending.set(false)
      return res
    } else {
      this.lcuPending.set(false)
      throw new Error
    }
  }
}

export const ConnectionStore = new Connector();