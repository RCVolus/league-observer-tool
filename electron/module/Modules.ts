import { LCUModule } from './LCUModule'
import { ReplayModule } from './ReplayModule'
import { LiveEventsModule } from './LiveEventsModule'
import { Menu, ipcMain } from 'electron';
import { Server } from '../connector/Server';
import { LCU } from '../connector/LCU'
import { InGameApi } from './InGameApi'
import { Lobby } from './Lobby';
import { Farsight } from './Farsight';

export class Modules {
  public modules : Map<string, LCUModule | ReplayModule | LiveEventsModule | InGameApi | Lobby | Farsight> = new Map()

  constructor (
    private lcu : LCU,
    private server : Server,
    private menu : Menu
  ) {
    this.modules.set("lcu-lobby", new Lobby(
      "lcu-lobby",
      "Lobby",
      "/lol-lobby/v2/lobby",
      this.lcu,
      this.server,
      this.menu
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
      this.menu
    ))

    this.modules.set("in-game-replay", new ReplayModule(
      "in-game-replay",
      "Replay",
      "module-league-replay",
      "set-playback",
      this.server,
      this.menu
    ))

    this.modules.set("in-game-live-events", new LiveEventsModule(
      "in-game-live-events",
      "Live Events",
      "module-league-in-game",
      "live-events",
      this.server,
      this.menu
    ))

    this.modules.set("in-game-api", new InGameApi(
      "in-game-api",
      "InGame",
      "module-league-in-game",
      this.server,
      this.menu
    ))

    this.modules.set("farsight", new Farsight(
      "in-game-farsight",
      "Farsight",
      "module-league-in-game",
      this.server,
      this.menu
    ))

    ipcMain.handle('modules-ready', async (e) => {
      return [...this.modules].map(([_k, m]) => {
        return {
          id: m.id,
          name: m.name,
          actions: m.actions,
          status: 0
        }
      })
    })
  }
}