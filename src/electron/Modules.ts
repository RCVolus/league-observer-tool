import { LCUModule } from './LCUModule'
import { ServerModule } from './ServerModule'
import { Menu } from 'electron';
import { Server } from './Server';
import { LCU } from './LCU'

export class Modules {
  public modules : Map<string, LCUModule | ServerModule> = new Map()

  constructor (
    private lcu : LCU,
    private server : Server,
    private menu : Menu
  ) {
    this.modules.set("lobby", new LCUModule(
      "lcu-lobby",
      "Lobby",
      "/lol-lobby/v2/lobby",
      this.lcu,
      this.server,
      this.menu,
      ["members"]
    ))
    this.modules.set("champ-select", new LCUModule(
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
    this.modules.set("end-of-game", new LCUModule(
      "lcu-end-of-game",
      "End of Game",
      "/lol-end-of-game/v1/eog-stats-block",
      this.lcu,
      this.server,
      this.menu,
      []
    ))
    this.modules.set("request", new ServerModule(
      "server-lcu-request",
      "LCU Request",
      "/request",
      this.lcu,
      this.server,
      this.menu
    ))
  }
}