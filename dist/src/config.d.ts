import { ConnectOptions } from "mongoose";
export interface BotConfigEmojis {
    [key: string]: string;
}
export interface BotConfig {
    token: string;
    prefix: string;
    inviteURL: string;
    supportURL: string;
    mongoDB: string;
    dbOptions: ConnectOptions;
    emojis: BotConfigEmojis;
    embed: {
        color: string;
        footer: string;
    };
    serverpath: string;
    rconport: number;
    rconpw: string;
    watchable: {
        serverOut: string;
        awfLogging: string;
        datastore: string;
        discord: string;
    };
    errorchannel: string;
    moderatorchannel: string;
    moderatorroleid: string;
    testbotid: string;
    factorioRoles: {
        admin: {
            id: string;
            name: string;
        };
        moderator: {
            id: string;
            name: string;
        };
        veteran: {
            id: string;
            name: string;
        };
        trusted: {
            id: string;
            name: string;
        };
    };
    archivePath: string;
    promPort: number;
    customPermissions: {
        name: string;
        roleid: string;
    }[];
    safeGuilds: string[];
}
declare const config: BotConfig;
export default config;
