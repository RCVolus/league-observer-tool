import { writable } from 'svelte/store'
import { Alert } from './Alert'
const { ipcRenderer } = window.require("electron");
import type { Response } from 'league-connect'
import type { Summoner as SummonerType } from '../../../types/Summoner/Summoner'


export const LCUCredentials = function () {
  const { subscribe, set } = writable<boolean>(false);
  return {
    subscribe,
    disconnect: () => { 
      ipcRenderer.send('lcu-stop-connect')

      ipcRenderer.once('lcu-connection', (_event, args : boolean) => {
        if (!args) {
          Alert.set({
            show: true,
            color: "danger",
            heading: "LCU Connection closed",
            text: "The connection to the LCU client failed pleas try again"
          })
        }
        set(args)
      })
    },
    connect: () => {
      ipcRenderer.send('lcu-start-connect')

      ipcRenderer.once('lcu-connection', (_event, args : boolean) => {
        if (!args) {
          Alert.set({
            show: true,
            color: "danger",
            heading: "LCU Connection Failed",
            text: "The connection to the LCU client failed pleas try again"
          })
        } else {
          Alert.set({
            show: true,
            color: "success",
            heading: "LCU connected",
            text: "The connection was established"
          })
          set(args)
          Summoner.getLoggedInUser();
        }
      })
    }
  }
}()

export const Summoner = function () {
  const { subscribe, set } = writable<SummonerType | undefined>(undefined);
  return {
    subscribe,
    getLoggedInUser: () => {
      ipcRenderer.send('lcu-request-current-summoner')

      ipcRenderer.once('lcu-response-current-summoner', async (_event, args: Response<SummonerType>) => {
        console.log(args);
        if (!args.ok) {
          Alert.set({
            show: true,
            color: "danger",
            heading: "Summoner not found",
            text: args.statusText
          })
        } else {
          const json = await args.json()
          set(json)
        }
      })
    }
  }
}()