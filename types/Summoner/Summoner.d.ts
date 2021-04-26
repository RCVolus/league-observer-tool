import type { RerollPoints } from './RerollPoints'

export interface Summoner {
  accountId: number
  displayName: string
  internalName: string
  nameChangeFlag: boolean
  percentCompleteForNextLevel: number
  profileIconId: number
  puuid: string
  rerollPoints: RerollPoints
  summonerId: number
  summonerLevel: number
  unnamed: boolean
  xpSinceLastLevel: number
  xpUntilNextLevel: number
}