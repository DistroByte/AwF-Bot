export interface FactorioServer {
  name: string;
  discordname: string;
  discordid: string;
  path: string;
  rconoffset: number;
  enabledGraftorio: boolean;
  toWatch: {
    serverOut: boolean;
    awfLogging: boolean;
    datastore: boolean;
    discord: boolean;
  };
  dev: boolean;
  hidden: boolean;
}

export type BotConfigEmojis = Record<string, string>;

export interface BotConfig {
  token: string;
  prefix: string;
  inviteURL: string;
  supportURL: string;
  mongoDB: string;
  dbOptions: any;
  embed: any;
  owner: {
    id: string;
    name: string;
  };
  emojis: BotConfigEmojis;
  serverpath: string;
  rconport: number;
  rconpw: string;
  watchable: {
    serverOut: "server.out";
    awfLogging: "script-output/ext/awflogging.out";
    datastore: "script-output/ext/datastore.out";
    discord: "script-output/ext/discord.out";
  };
  errorchannel: string;
  moderatorchannel: string;
  moderatorroleid: string;
  testbotid: string;
  factorioRoles: Record<
    string,
    {
      id: string;
      name: string;
    }
  >;
  archivePath: string;
  scenarioRootPath: string;
  promPort: number;
  customPermissions: { name: string; roleid: string }[];
  adminroleid: string;
  grafanaInterval: number;
  safeGuilds: string[];
}
