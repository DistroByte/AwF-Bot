/**
 * @file Jammy's core. Based off of ComfyBot
 */

const { Client, Collection, MessageEmbed } = require('discord.js');
const NodeCache = require("node-cache");
const factorioServers = require("../servers");
const FIFO = require("fifo")

const util = require('util'),
  path = require('path'),
  AmeClient = require("amethyste-api"),
  moment = require('moment');

class Comfy extends Client {
  constructor(options) {
    super(options)
    this.consts = require("../consts")
    this.config = require('../config');
    this.emotes = this.config.emojis;

    this.commands = new Collection();
    this.aliases = new Collection();

    this.logger = require('../helpers/logger');
    this.functions = require('../helpers/functions');
    this.wait = util.promisify(setTimeout);

    this.guildsData = require('./Guild');
    this.usersData = require('./User');
    this.membersData = require('./Member');
    this.logs = require('./Log');

    this.serverQueues = new Map();
    factorioServers.forEach((server) => {
      if (!server.discordid) return
      this.serverQueues.set(server.discordid, {
        server: server,
        messageQueue: FIFO(),
        sendingMessage: false
      })
    })
    setInterval(() => {
      this.serverQueues.forEach((server) => {
        if (server.sendingMessage === true) return
        server.sendingMessage = true
        let message = ""
        while (!server.messageQueue.isEmpty()) {
					let fromQueue = server.messageQueue.first()
					if (fromQueue.length > this.consts.discordMessageLengthLimit) {
						// if the line from the server is over 2000 chars then just remove it and don't care about it
						server.messageQueue.shift()
					} else {
						if (message.length + fromQueue.length > this.consts.discordMessageLengthLimit) break
						message += `${server.messageQueue.shift()}\n`
        }
        if (message.length) {
          this.channels.cache.get(server.server.discordid)?.send(message).then(() => server.sendingMessage = false)
        } else server.sendingMessage = false
      })
    }, 50)
    this.factorioServers = factorioServers

    this.states = {};

    this.knownGuilds = []

    this.databaseCache = {};
    this.databaseCache.users = new Collection();
    this.databaseCache.guilds = new Collection();
    this.databaseCache.members = new Collection();
    this.databaseCache.usersReminds = new Collection();
    this.databaseCache.mutedUsers = new Collection();
    this.databaseCache.factorioServers = new Collection();

    this.cache = {}
    this.cache.linkingCache = new NodeCache({stdTTL: 600})

    this.AmeAPI = new AmeClient(this.config.apiKeys.amethyste);
  }

  printDate(date, format) {
    return moment(new Date(date))
      .locale('UTC')
      .format('hh:mm a, DD-MM-YYYY');
  }

  loadCommand(commandPath, commandName) {
    try {
      const props = new (require(`.${commandPath}${path.sep}${commandName}`))(this);
      props.conf.location = commandPath;
      if (props.init) {
        props.init(this);
      }
      this.commands.set(props.help.name, props);
      props.help.aliases.forEach((alias) => {
        this.aliases.set(alias, props.help.name);
      });
      return false;
    } catch (e) {
      return `Unable to load command ${commandName}: ${e}`;
    }
  }

  async unloadCommand(commandPath, commandName) {
    let command;
    if (this.commands.has(commandName)) {
      command = this.commands.get(commandName);
    } else if (this.aliases.has(commandName)) {
      command = this.commands.get(this.aliases.get(commandName));
    }
    if (!command) {
      return `The command \`${commandName}\` doesn't seem to exist, nor is it an alias. Try again!`;
    }
    if (command.shutdown) {
      await command.shutdown(this);
    }
    delete require.cache[require.resolve(`.${commandPath}${path.sep}${commandName}.js`)];
    return false;
  }

  async findOrCreateGuild({ id: guildID }, isLean) {
    if (this.databaseCache.guilds.get(guildID)) {
      return isLean ? this.databaseCache.guilds.get(guildID).toJSON() : this.databaseCache.guilds.get(guildID);
    } else {
      let guildData = (isLean ? await this.guildsData.findOne({ id: guildID }).populate('members').lean() : await this.guildsData.findOne({ id: guildID }).populate('members'));
      if (guildData) {
        if (!isLean) this.databaseCache.guilds.set(guildID, guildData);
        return guildData;
      } else {
        guildData = new this.guildsData({ id: guildID });
        await guildData.save();
        this.databaseCache.guilds.set(guildID, guildData);
        return isLean ? guildData.toJSON() : guildData;
      }
    }
  }

  async findOrCreateMember({ id: memberID, guildID }, isLean) {
    if (this.databaseCache.members.get(`${memberID}${guildID}`)) {
      return isLean ? this.databaseCache.members.get(`${memberID}${guildID}`).toJSON() : this.databaseCache.members.get(`${memberID}${guildID}`);
    } else {
      let memberData = (isLean ? await this.membersData.findOne({ guildID, id: memberID }).lean() : await this.membersData.findOne({ guildID, id: memberID }));
      if (memberData) {
        if (!isLean) this.databaseCache.members.set(`${memberID}${guildID}`, memberData);
        return memberData;
      } else {
        memberData = new this.membersData({ id: memberID, guildID: guildID });
        await memberData.save();
        const guild = await this.findOrCreateGuild({ id: guildID });
        if (guild) {
          guild.members.push(memberData._id);
          await guild.save();
        }
        this.databaseCache.members.set(`${memberID}${guildID}`, memberData);
        return isLean ? memberData.toJSON() : memberData;
      }
    }
  }

  async findOrCreateUser({ id: userID }, isLean) {
    if (this.databaseCache.users.get(userID)) {
      return isLean ? this.databaseCache.users.get(userID).toJSON() : this.databaseCache.users.get(userID);
    } else {
      let userData = (isLean ? await this.usersData.findOne({ id: userID }).lean() : await this.usersData.findOne({ id: userID }));
      if (userData) {
        if (!isLean) this.databaseCache.users.set(userID, userData);
        return userData;
      } else {
        userData = new this.usersData({ id: userID });
        await userData.save();
        this.databaseCache.users.set(userID, userData);
        return isLean ? userData.toJSON() : userData;
      }
    }
  }
  async findUserFactorioName(factorioname, isLean) {
    let userData = (isLean ? await this.usersData.findOne({ factorioName: factorioname }).lean() : await this.usersData.findOne({ factorioName: factorioname }));
    if (!isLean && userData?.id) this.databaseCache.users.set(userData?.id, userData);
    return userData;
  }

  convertTime(time, type, noPrefix, locale) {
    if (!type) time = 'to';
    const m = moment(time).locale('UTC');
    return (type === 'to' ? m.toNow(noPrefix) : m.fromNow(noPrefix));
  }

  async resolveUser(search) {
    let user = null;
    if (!search || typeof search !== "string") return;
    // Try ID search
    if (search.match(/^<@!?(\d+)>$/)) {
      const id = search.match(/^<@!?(\d+)>$/)[1];
      user = this.users.fetch(id).catch(() => { });
      if (user) return user;
    }
    // Try username search
    if (search.match(/^!?(\w+)#(\d+)$/)) {
      const username = search.match(/^!?(\w+)#(\d+)$/)[0];
      const discriminator = search.match(/^!?(\w+)#(\d+)$/)[1];
      user = this.users.cache.find((u) => u.username === username && u.discriminator === discriminator);
      if (user) return user;
    }
    if (search.match(/^!?(\w+)$/)) {
      user = this.users.cache.find((u) => u.username.toLowerCase() === search.toLowerCase())
      if (user) return user;
    }
    user = await this.users.fetch(search).catch(() => { });
    return user;
  }

  async resolveMember(search, guild) {
    let member = null;
    if (!search || typeof search !== 'string') return;
    // Try ID search
    if (search.match(/^<@!?(\d+)>$/)) {
      const id = search.match(/^<@!?(\d+)>$/)[1];
      member = await guild.members.fetch(id).catch(() => { });
      if (member) return member;
    }
    // Try username search
    if (search.match(/^!?(\w+)/)) {
      guild = await guild.fetch();
      member = guild.members.cache.find((m) => (m.user.tag.toLowerCase() === search || m.user.username.toLowerCase() === search));
      if (member) return member;
    }
    member = await guild.members.fetch(search).catch(() => { });
    return member;
  }

  async resolveRole(search, guild) {
    let role = null;
    if (!search || typeof search !== 'string') return;
    // Try ID search
    if (search.match(/^<@&!?(\d+)>$/)) {
      const id = search.match(/^<@&!?(\d+)>$/)[1];
      role = guild.roles.cache.get(id);
      if (role) return role;
    }
    // Try name search
    role = guild.roles.cache.find((r) => search === r.name);
    if (role) return role;
    role = guild.roles.cache.get(search);
    return role;
  }
}

module.exports = Comfy;
