import { ProdModule } from './ProdModule'
import { Menu } from 'electron';
import { Server } from './Server';
import { LCU } from './LCU'

export class Modules {
  public modules : Map<string, ProdModule> = new Map()

  constructor (
    private lcu : LCU,
    private server : Server,
    private menu : Menu
  ) {
    this.modules.set("lobby", new ProdModule(
      "lobby",
      "Lobby",
      "/lol-lobby/v2/lobby",
      this.lcu,
      this.server,
      this.menu
    ))
    this.modules.set("champ-select", new ProdModule(
      "champ-select",
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
    this.modules.set("end-of-game", new ProdModule(
      "end-of-game",
      "End of Game",
      "/lol-end-of-game/v1/eog-stats-block",
      this.lcu,
      this.server,
      this.menu
    ))
  }
}