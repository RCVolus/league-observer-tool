import { ipcMain } from 'electron';
import { authenticate, request, Credentials, LeagueClient } from 'league-connect'

export function lcuAPI () {
  let credentials : Credentials
  let leagueClient : LeagueClient

  ipcMain.on('lcu-start-connect', async (event, _args) => {
    try {
      credentials = await authenticate();
      handleConnection(credentials, event);
    } catch (e) {
      event.sender.send('lcu-connection', false)
    }
  })

  ipcMain.on('lcu-stop-connect', (event, _args) => {
    if (leagueClient) {
      leagueClient.stop()
      event.sender.send('lcu-connection', false)
    }
  })

  ipcMain.on('lcu-request-current-summoner', async (event, _args) => {
    try {
      const response = await request({
        method: 'GET',
        url: '/lol-summoner/v1/current-summoner'
      }, credentials)

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