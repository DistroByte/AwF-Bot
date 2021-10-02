import { getModelForClass, Passthrough, prop } from "@typegoose/typegoose"

export class UserClass {
  @prop()
  id: string

  @prop({default: Date.now()})
  registeredAt: number

  @prop({default: ""})
  factorioName: string
  @prop({default: []})
  factorioRoles: string[]

  @prop({type: () => new Passthrough({
    deaths: 0,
    builtEntities: 0,
    timePlayed: 0,
    points: 0
  })})
  factorioStats: {
    deaths: number
    builtEntities: number
    timePlayed: number
    points: number
  }
}

const UserModel = getModelForClass(UserClass)
export default UserModel
