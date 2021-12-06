import {
  getModelForClass,
  modelOptions,
  Passthrough,
  prop,
} from "@typegoose/typegoose";

@modelOptions({
  schemaOptions: {
    collection: "users",
  },
})
export class UserClass {
  @prop()
  id: string;

  @prop({ default: Date.now() })
  registeredAt: number;

  @prop({ default: "" })
  factorioName: string;
  @prop({ default: [], type: [String] })
  factorioRoles: string[];

  @prop({
    type: () =>
      new Passthrough({
        deaths: Number,
        builtEntities: Number,
        timePlayed: Number,
        points: Number,
      }),
  })
  factorioStats: {
    deaths: number;
    builtEntities: number;
    timePlayed: number;
    points: number;
  };
}

const UserModel = getModelForClass(UserClass);
export default UserModel;
