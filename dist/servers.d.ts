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
}
declare const servers: FactorioServer[];
export default servers;
