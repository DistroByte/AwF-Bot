/**
 * @file Jammy's core. Based off of ComfyBot
 */
import { Client, ClientOptions, Collection, TextChannel } from "discord.js";
import NodeCache from "node-cache";
import { FactorioServer } from "../servers";
import FIFO from "fifo";
import { BotConfig as BotConfigType, BotConfigEmojis } from "../config";
import { BotConsts as BotConstsType } from "../consts";
import { Command } from "./Command";
import BotLogger from "../helpers/logger";
import BotUsersData, { UserClass } from "./User";
import ServerStatisticsModel from "./Serverstatistics";
declare type ArgumentTypes<F extends Function> = F extends (...args: infer A) => any ? A : never;
interface ComfyOptions extends ClientOptions {
}
declare class Comfy extends Client {
    config: BotConfigType;
    emotes: BotConfigEmojis;
    consts: BotConstsType;
    commands: Collection<string, Command>;
    aliases: Collection<string, string>;
    logger: typeof BotLogger;
    usersData: typeof BotUsersData;
    serverQueues: Map<string, {
        server: FactorioServer;
        messageQueue: FIFO;
        sendingMessage: boolean;
    }>;
    factorioServers: FactorioServer[];
    databaseCache: {
        users: Collection<string, UserClass>;
        factorioServers: Collection<string, typeof ServerStatisticsModel>;
    };
    cache: {
        linkingCache: NodeCache;
    };
    constructor(options: ComfyOptions);
    printDate(date: Date): string;
    loadCommand(commandPath: string, commandName: string): string | false;
    unloadCommand(commandPath: string, commandName: string): Promise<string | false>;
    findOrCreateUser({ id: userID }: {
        id: any;
    }): Promise<UserClass | (import("mongoose").Document<any, import("@typegoose/typegoose/lib/types").BeAnObject, any> & UserClass & import("@typegoose/typegoose/lib/types").IObjectWithTypegooseFunction & {
        _id: any;
    })>;
    findUserFactorioName(factorioname: string): Promise<import("mongoose").Document<any, import("@typegoose/typegoose/lib/types").BeAnObject, any> & UserClass & import("@typegoose/typegoose/lib/types").IObjectWithTypegooseFunction & {
        _id: any;
    }>;
    emergencylog(message: ArgumentTypes<TextChannel["send"]>): void;
}
export default Comfy;
