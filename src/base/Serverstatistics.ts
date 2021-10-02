import {
  getModelForClass,
  modelOptions,
  Passthrough,
  prop,
} from "@typegoose/typegoose";

@modelOptions({
  schemaOptions: {
    collection: "serverstatistics",
  },
})
export class ServerStatisticsClass {
  @prop()
  id: string;
  @prop()
  serverName: string;
  @prop()
  serverID: string;

  @prop({ default: 0 })
  rocketLaunches: number;

  // this is disabled until https://github.com/typegoose/typegoose/pull/619 is merged
  // @prop({type: () => new Passthrough({
  //   name: String,
  //   level: 1
  // })})
  // completedResearch: {name: string, level: number}[]

  @prop({
    type: () =>
      new Passthrough({
        big: false,
        behemoth: false,
      }),
  })
  evolution: {
    big: boolean;
    behemoth: boolean;
  };
}
const ServerStatistics = getModelForClass(ServerStatisticsClass);
export default ServerStatistics;
