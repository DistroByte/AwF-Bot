/**
 * @file Jammy's core. Based off of ComfyBot
 */

import { Client, ClientOptions, Collection, Message, MessageEmbed, TextChannel } from "discord.js";
import NodeCache from "node-cache";
import factorioServers, { FactorioServer } from "../servers";
import FIFO from "fifo"
import path from "path"
import moment from "moment"
import BotConfig, { BotConfig as BotConfigType, BotConfigEmojis } from "../config"
import BotConsts, { BotConsts as BotConstsType } from "../consts";
import { Command } from "./Command";
import BotLogger from "../helpers/logger"
import BotUsersData, { UserClass } from "./User"
import ServerStatisticsModel from "./Serverstatistics";

type ArgumentTypes<F extends Function> = F extends (args: infer A) => any ? A : never;

interface ComfyOptions extends ClientOptions {
}
class Comfy extends Client {
  config: BotConfigType
  emotes: BotConfigEmojis
  consts: BotConstsType
  commands: Collection<string, Command>
  aliases: Collection<string, string>
  logger: typeof BotLogger
  usersData: typeof BotUsersData
  serverQueues: Map<string, {
    server: FactorioServer,
    messageQueue: FIFO<string>,
    sendingMessage: boolean
  }>
  factorioServers: FactorioServer[]
  databaseCache: {
    users: Collection<string, UserClass>
    factorioServers: Collection<string, typeof ServerStatisticsModel>
  }
  cache: {
    linkingCache: NodeCache
  }
  constructor(options: ComfyOptions) {
    super(options);
    this.consts = BotConsts;
    this.config = BotConfig;
    this.emotes = this.config.emojis;

    this.commands = new Collection();
    this.aliases = new Collection();

    this.logger = BotLogger;

    this.usersData = BotUsersData;

    this.serverQueues = new Map();
    factorioServers.forEach((server) => {
      if (!server.discordid) return;
      this.serverQueues.set(server.discordid, {
        server: server,
        messageQueue: FIFO(),
        sendingMessage: false,
      });
    });
    setInterval(() => {
      this.serverQueues.forEach((server) => {
        if (server.sendingMessage === true) return;
        server.sendingMessage = true;
        let message = "";
        while (!server.messageQueue.isEmpty()) {
          const fromQueue = server.messageQueue.first();
          if (fromQueue.length > this.consts.discordMessageLengthLimit) {
            // if the line from the server is over 2000 chars then just remove it and don't care about it
            server.messageQueue.shift();
          } else {
            // if the new line in addition is too long then don't send it
            if (
              message.length + fromQueue.length >
              this.consts.discordMessageLengthLimit
            )
              break;
            message += `${server.messageQueue.shift()}\n`; // remove from queue if it is within limits
          }
        }
        if (message.length) {
          const channel = this.channels.cache.get(server.server.discordid)
          if (channel.isText()) channel.send(message).then(() => (server.sendingMessage = false));
        } else {
          server.sendingMessage = false;
        }
      });
    }, 100);
    this.factorioServers = factorioServers;

    this.databaseCache = {
      users: new Collection(),
      factorioServers: new Collection(),
    };

    this.cache = {
      linkingCache: new NodeCache({ stdTTL: 600 }),
    }
  }

  printDate(date: Date) {
    return moment(new Date(date)).locale("UTC").format("hh:mm a, DD-MM-YYYY");
  }

  async loadCommand(commandPath: string, commandName: string) {
    try {
      const props: Command = await import(`.${commandPath}${path.sep}${commandName}`).then(c=>c.default)
      
      this.commands.set(props.name, props);
      props.aliases.forEach((alias) => {
        this.aliases.set(alias, props.name);
      });
      return false;
    } catch (e) {
      return `Unable to load command ${commandName}: ${e}`;
    }
  }

  async unloadCommand(commandPath: string, commandName: string) {
    let command: Command<unknown>;
    if (this.commands.has(commandName)) {
      command = this.commands.get(commandName);
    } else if (this.aliases.has(commandName)) {
      command = this.commands.get(this.aliases.get(commandName));
    }
    if (!command) {
      return `The command \`${commandName}\` doesn't seem to exist, nor is it an alias. Try again!`;
    }
    return false;
  }

  async findOrCreateUser({ id: userID }) {
    if (this.databaseCache.users.get(userID)) {
      return this.databaseCache.users.get(userID)
    } else {
      let userData = await this.usersData.findOne({ id: userID })
      if (userData) {
        this.databaseCache.users.set(userID, userData);
        return userData;
      } else {
        userData = new this.usersData({ id: userID });
        await userData.save();
        this.databaseCache.users.set(userID, userData);
        return userData;
      }
    }
  }
  async findUserFactorioName(factorioname: string) {
    let userData = await this.usersData.findOne({ factorioName: factorioname });
    if (userData?.id)
      this.databaseCache.users.set(userData.id, userData);
    return userData;
  }

  emergencylog(message: ArgumentTypes<TextChannel["send"]>) {
    if (this.config.moderatorchannel) {
      const guild = this.guilds.cache.forEach((guild) =>
        guild.channels.cache.forEach(
          (channel) =>
            channel.id === this.config.moderatorchannel && channel.isText() && channel.send(message)
        )
      );
    }
  }
}

export default Comfy