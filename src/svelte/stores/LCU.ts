import { writable } from 'svelte/store'
import { Alert } from './Alert'
const { ipcRenderer } = window.require("electron");

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
        }
        set(args)
        LCUClient.getLoggedInUser();
      })
    }
  }
}()

export const LCUClient = function () {
  const { subscribe, set } = writable<any>(null);
  return {
    subscribe,
    getLoggedInUser: () => {

    }
  }
}()