import { Sender } from "../helper/Sender";
import { DisplayError } from "../../types/DisplayError";
import { LPTEvent } from "../../types/LPTE";
import { LCUModule } from "./LCUModule";

export class Lobby extends LCUModule {
  /**
   * @param puuid string
   * @param elo tier: string, division: string
  */
  private players : Map<string, {tier: string, division: string}> = new Map()

  async handleData(data: any, event: any): Promise<void> {
    if (event.eventType === 'Create') {
      this.players = new Map()
    }

    /* this.data.push({data, event}) */

    const selectedData : {[n: string]: any} = data

    if (data) {
      await Promise.all(data.gameConfig.customTeam100.map((m: any) => this.getPlayerElo(m)))
      await Promise.all(data.gameConfig.customTeam200.map((m: any) => this.getPlayerElo(m)))
    }

    try {
      const obj : LPTEvent = {
        meta: {
          namespace: "lcu",
          type: `${this.id}-${event.eventType.toLowerCase()}`, 
          timestamp: new Date().getTime() + this.server.prodTimeOffset
        },
        data: event.eventType != "Delete" ? selectedData : undefined
      }
      this.server.send(obj)
    } catch (e: any) {
      Sender.emit('error', {
        color: "danger",
        text: e.message || 'error while sending data to prod tool'
      } as DisplayError)
    }
  }

  async getPlayerElo (m: any): Promise<any> {
    if (!this.players.has(m.puuid)) {
      const elo = await this.lcu.request({
        method: 'GET',
        url: `/lol-ranked/v1/ranked-stats/${m.puuid}`
      })

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
          division: soloQueue.division
        })
      } else if (flexQueue.tier !== 'NONE') {
        m.elo = {
          tier: flexQueue.tier,
          division: flexQueue.division
        }
        this
        this.players.set(m.puuid, {
          tier: flexQueue.tier,
          division: flexQueue.division
        })
      } else {
        m.elo = {
          tier: 'NONE',
          division: 'NA'
        }
        this.players.set(m.puuid, {
          tier: 'NONE',
          division: 'NA'
        })
      }

      return m
    } else {
      m.elo = this.players.get(m.puuid)
      return m
    }
  }
}