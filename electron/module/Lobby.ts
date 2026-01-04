import { Sender } from "../helper/Sender";
import { DisplayError } from "../../types/DisplayError";
import { LPTEvent } from "../../types/LPTE";
import { LCUModule } from "./LCUModule";
import { FetchError } from "electron-fetch";

export class Lobby extends LCUModule {
  /**
   * @param puuid string
   * @param elo tier: string, division: string
  */
  private players: Map<string, { tier: string, division: string, summonerName: string }> = new Map()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async handleData(data: any, event: any): Promise<void> {
    if (event.eventType === 'Create') {
      this.players = new Map()
    }

    /* this.data.push({data, event}) */

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let selectedData: { [n: string]: any } = {}

    if (!this.dataPoints) selectedData = data
    else {
      for (const key of this.dataPoints) {
        selectedData[key] = data[key]
      }
    }

    if (data) {   
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      selectedData.members = await Promise.all(data.members.map((m: any) => this.getPlayer(m)))

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      selectedData.gameConfig.customTeam100 = data.gameConfig.customTeam100.map((p: any) => selectedData.members.find((m: any) => m.puuid === p.puuid))
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      selectedData.gameConfig.customTeam200 = data.gameConfig.customTeam200.map((p: any) => selectedData.members.find((m: any) => m.puuid === p.puuid))
    }

    try {
      const obj: LPTEvent = {
        meta: {
          namespace: "lcu",
          type: `${this.id}-${event.eventType.toLowerCase()}`,
          timestamp: new Date().getTime() + this.server.prodTimeOffset
        },
        data: event.eventType !== "Delete" ? selectedData : undefined
      }
      this.server.send(obj)
    } catch (e) {
      if ((e as FetchError).code && (e as FetchError).code === "ECONNREFUSED") {
        Sender.emit(this.id, 1)
      } else {
        this.disconnect()

        this.logger.error(e)
        Sender.emit('error', {
          color: "danger",
          text: (e as Error).message
        } as DisplayError)
      }
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async getPlayer(m: any): Promise<any> {
    if (!this.players.has(m.puuid)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const elo = await this.lcu.request<any>({
        method: 'GET',
        url: `/lol-ranked/v1/ranked-stats/${m.puuid}`
      })

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const player = await this.lcu.request<any>({
        method: 'GET',
        url: `/lol-summoner/v2/summoners/puuid/${m.puuid}`
      })

      m.summonerName = player.gameName

      if (elo === undefined) {
        m.elo = {
          tier: 'NONE',
          division: 'NA'
        }

        return m
      }

      const soloQueue = elo.queueMap.RANKED_SOLO_5x5
      const flexQueue = elo.queueMap.RANKED_FLEX_SR

      if (soloQueue.tier !== 'NONE') {
        m.elo = {
          tier: soloQueue.tier,
          division: soloQueue.division
        }
        this.players.set(m.puuid, {
          tier: soloQueue.tier,
          division: soloQueue.division,
          summonerName: player.gameName
        })
      } else if (flexQueue.tier !== 'NONE') {
        m.elo = {
          tier: flexQueue.tier,
          division: flexQueue.division
        }
        this.players.set(m.puuid, {
          tier: flexQueue.tier,
          division: flexQueue.division,
          summonerName: player.gameName
        })
      } else {
        m.elo = {
          tier: 'NONE',
          division: 'NA'
        }
        this.players.set(m.puuid, {
          tier: 'NONE',
          division: 'NA',
          summonerName: player.gameName
        })
      }

      return m
    } else {
      m.elo = this.players.get(m.puuid)
      return m
    }
  }
}