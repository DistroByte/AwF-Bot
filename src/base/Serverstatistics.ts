import { getModelForClass, Passthrough, prop } from "@typegoose/typegoose"
import BotConfig from "../config"

export class ServerStatistics {
  @prop()
  id: string
  @prop()
  serverName: string
  @prop()
  serverID: string

  @prop({default: 0})
  rocketLaunches: number

  @prop({type: () => new Passthrough([{
    name: String,
    level: 1
  }])})
  completedResearch: {name: string, level: number}[]

  @prop({type: () => new Passthrough({
    big: false,
    behemoth: false
  })})
  evolution: {
    big: boolean
    behemoth: boolean
  }
}
const ServerStatisticsModel = getModelForClass(ServerStatistics)
export default ServerStatisticsModel