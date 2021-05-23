import { LCUModule } from './LCUModule'
import { ServerModule } from './ServerModule'
import { Menu, ipcMain } from 'electron';
import { Server } from './Server';
import { LCU } from './LCU'
import { Sender } from './Sender';

export class Modules {
  public modules : Map<string, LCUModule | ServerModule> = new Map()

  constructor (
    private lcu : LCU,
    private server : Server,
    private menu : Menu
  ) {
    this.modules.set("lcu-lobby", new LCUModule(
      "lcu-lobby",
      "Lobby",
      "/lol-lobby/v2/lobby",
      this.lcu,
      this.server,
      this.menu,
      ["members"]
    ))
    this.modules.set("lcu-champ-select", new LCUModule(
      "lcu-champ-select",
      "Champselect",
      "/lol-champ-select/v1/session",
      this.lcu,
      this.server,
      this.menu,
      [
        "actions",
        "bans",
        "myTeam",
        "theirTeam",
        "timer"
      ]
    ))
    this.modules.set("lcu-end-of-game", new LCUModule(
      "lcu-end-of-game",
      "End of Game",
      "/lol-end-of-game/v1/eog-stats-block",
      this.lcu,
      this.server,
      this.menu,
      []
    ))
    this.modules.set("server-lcu-request", new ServerModule(
      "server-lcu-request",
      "LCU Request",
      "/request",
      this.lcu,
      this.server,
      this.menu
    ))

    ipcMain.on('modules-ready', async (e) => {
      e.returnValue = [...this.modules].map(([_k, m]) => {
        return {
          id: m.id,
          name: m.name
        }
      })
    })
  }
}