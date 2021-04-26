import { ipcMain } from 'electron';
import { authenticate, request, Credentials, LeagueClient } from 'league-connect'
import type { Summoner } from '../../types/Summoner/Summoner'
import fetch from 'node-fetch'
import * as https from 'https';

export function lcuAPI () {
  let credentials : Credentials
  let leagueClient : LeagueClient

  ipcMain.on('lcu-start-connect', async (event) => {
    try {
      credentials = await authenticate();
      const res = await fetch("https://riot:sfRDljZWzKaO8DgP11Fj3Q@172.17.64.1:65530/lol-summoner/v1/current-summoner", {
        agent: new https.Agent({
          rejectUnauthorized: false
        })
      })
      console.log(res)
      event.sender.send('console', res)
      event.sender.send('console', credentials)
      handleConnection(credentials, event);
    } catch (e) {
      event.sender.send('console', e)
      event.sender.send('lcu-connection', false)
    }
  })

  ipcMain.on('lcu-stop-connect', (event) => {
    if (leagueClient) {
      leagueClient.stop()
      event.sender.send('lcu-connection', false)
    }
  })

  ipcMain.on('lcu-request-current-summoner', async (event) => {
    try {
      const response = await request<any, Summoner>({
        method: 'GET',
        url: '/lol-summoner/v1/current-summoner'
      }, credentials)
      event.sender.send('console', response)

      event.sender.send('lcu-response-current-summoner', response)
    } catch (error) {
      event.sender.send('lcu-response-current-summoner', error)
    }
  })

  function handleConnection (credentials:Credentials, event: Electron.IpcMainEvent) {
    event.sender.send('lcu-connection', true)
    leagueClient = new LeagueClient(credentials);

    leagueClient.on('connect', (newCredentials) => {
      credentials = newCredentials
      event.sender.send('lcu-connection', true)
    })
    
    leagueClient.on('disconnect', () => {
      event.sender.send('lcu-connection', false)
    })

    leagueClient.start()
  }
}