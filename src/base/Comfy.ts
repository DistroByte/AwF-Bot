/**
 * @file Jammy's core. Based off of ComfyBot
 */

import {
  Client,
  ClientOptions,
  Collection,
  TextChannel,
} from "discord.js";
import NodeCache from "node-cache";
import factorioServers from "../servers";
import {
  FactorioServer,
  BotConfig as BotConfigType,
  BotConfigEmojis,
} from "../types";
import FIFO from "fifo";
import path from "path";
import moment from "moment";
import BotConfig from "../config";
import BotConsts, { BotConsts as BotConstsType } from "../consts";
import { Command } from "./Command";
import BotLogger from "../helpers/logger";
import BotUsersData from "./User";

type ArgumentTypes<F extends Function> = F extends (args: infer A) => any
  ? A
  : never;

interface ComfyOptions extends ClientOptions {}
class Comfy extends Client {
  config: BotConfigType;
  emotes: BotConfigEmojis;
  consts: BotConstsType;
  commands: Collection<string, Command>;
  aliases: Collection<string, string>;
  logger: typeof BotLogger;
  usersData: typeof BotUsersData;
  serverQueues: Map<
    string,
    {
      server: FactorioServer;
      messageQueue: FIFO<string>;
      sendingMessage: boolean;
    }
  >;
  factorioServers: FactorioServer[];
  cache: {
    linkingCache: NodeCache;
  };
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
      this.serverQueues.forEach(async (server) => {
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
          const channel = await this.channels.fetch(server.server.discordid);
          if (channel.isText())
            channel.send(message).then(() => (server.sendingMessage = false));
        } else {
          server.sendingMessage = false;
        }
      });
    }, 100);
    this.factorioServers = factorioServers;

    this.cache = {
      linkingCache: new NodeCache({ stdTTL: 600 }),
    };
  }

  printDate(date: Date) {
    return moment(new Date(date)).locale("UTC").format("hh:mm a, DD-MM-YYYY");
  }

  async loadCommand(commandPath: string, commandName: string) {
    try {
      const props: Command = await import(
        `.${commandPath}${path.sep}${commandName}`
      ).then((c) => c.default);

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
    let userData = await this.usersData.findOne({ id: userID });
    if (userData) {
      return userData;
    } else {
      userData = await this.usersData.create({ id: userID });
      return userData;
    }
  }

  async findUserFactorioName(factorioname: string) {
    let userData = await this.usersData.findOne({ factorioName: factorioname });
    return userData;
  }

  emergencylog(message: ArgumentTypes<TextChannel["send"]>) {
    if (this.config.moderatorchannel) {
      const guild = this.guilds.cache.forEach((guild) =>
        guild.channels.cache.forEach(
          (channel) =>
            channel.id === this.config.moderatorchannel &&
            channel.isText() &&
            channel.send(message)
        )
      );
    }
  }

  async sendToErrorChannel(message: ArgumentTypes<TextChannel["send"]>) {
    if (this.config.errorchannel) {
      const guild = this.guilds.cache.forEach((guild) =>
        guild.channels.cache.forEach(
          (channel) =>
            channel.id === this.config.errorchannel &&
            channel.isText() &&
            channel.send(message)
        )
      );
    }
  }
}

export default Comfy;
