import { LCUModule } from './LCUModule'
import { LCURequestModule } from './LCURequestModule'
import { ReplayModule } from './ReplayModule'
import { LiveEventsModule } from './LiveEventsModule'
import { Menu, ipcMain } from 'electron';
import { Server } from './Server';
import { LCU } from './LCU'
import { InGameApi } from './InGameApi'

export class Modules {
  public modules : Map<string, LCUModule | LCURequestModule | ReplayModule | LiveEventsModule | InGameApi> = new Map()

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
    this.modules.set("lcu-request", new LCURequestModule(
      "lcu-request",
      "LCU Request",
      "lcu",
      "http-request",
      this.lcu,
      this.server,
      this.menu
    ))

    this.modules.set("in-game-replay", new ReplayModule(
      "in-game-replay",
      "Replay",
      "league-replay",
      "set-playback",
      this.server,
      this.menu
    ))

    /**
     * @deprecated for now since not useful
    */
    /* this.modules.set("in-game-live-events", new LiveEventsModule(
      "in-game-live-events",
      "Live Events",
      "league-live-events",
      "send",
      this.server,
      this.menu
    )) */

    this.modules.set("in-game-api", new InGameApi(
      "in-game-api",
      "InGame",
      "league-in-game",
      this.server,
      this.menu
    ))

    ipcMain.on('modules-ready', async (e) => {
      e.returnValue = [...this.modules].map(([_k, m]) => {
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