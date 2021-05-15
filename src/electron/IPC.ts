import { ipcMain } from 'electron';
import { authenticate, request, Credentials, LeagueClient } from 'league-connect'
import type { Summoner } from '../../types/Summoner/Summoner'

export function lcuAPI () {
  let credentials : Credentials
  let leagueClient : LeagueClient

  ipcMain.on('lcu-start-connect', async (event) => {
    try {
      credentials = await authenticate();
      handleConnection(credentials, event);
    } catch (e) {
      event.sender.send('console', e)
      event.sender.send('lcu-connection', undefined)
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
    event.sender.send('lcu-connection', credentials)
    leagueClient = new LeagueClient(credentials);

    leagueClient.on('connect', (newCredentials) => {
      credentials = newCredentials
      event.sender.send('lcu-connection', credentials)
    })
    
    leagueClient.on('disconnect', () => {
      event.sender.send('lcu-connection', undefined)
    })

    leagueClient.start()
  }
}