"use strict";
/**
 * @file Jammy's core. Based off of ComfyBot
 */
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const discord_js_1 = require("discord.js");
const node_cache_1 = (0, tslib_1.__importDefault)(require("node-cache"));
const servers_1 = (0, tslib_1.__importDefault)(require("../servers"));
const fifo_1 = (0, tslib_1.__importDefault)(require("fifo"));
const path_1 = (0, tslib_1.__importDefault)(require("path"));
const moment_1 = (0, tslib_1.__importDefault)(require("moment"));
const config_1 = (0, tslib_1.__importDefault)(require("../config"));
const consts_1 = (0, tslib_1.__importDefault)(require("../consts"));
const logger_1 = (0, tslib_1.__importDefault)(require("../helpers/logger"));
const User_1 = (0, tslib_1.__importDefault)(require("./User"));
class Comfy extends discord_js_1.Client {
    constructor(options) {
        super(options);
        this.consts = consts_1.default;
        this.config = config_1.default;
        this.emotes = this.config.emojis;
        this.commands = new discord_js_1.Collection();
        this.aliases = new discord_js_1.Collection();
        this.logger = logger_1.default;
        this.usersData = User_1.default;
        this.serverQueues = new Map();
        servers_1.default.forEach((server) => {
            if (!server.discordid)
                return;
            this.serverQueues.set(server.discordid, {
                server: server,
                messageQueue: (0, fifo_1.default)(),
                sendingMessage: false,
            });
        });
        setInterval(() => {
            this.serverQueues.forEach((server) => {
                if (server.sendingMessage === true)
                    return;
                server.sendingMessage = true;
                let message = "";
                while (!server.messageQueue.isEmpty()) {
                    const fromQueue = server.messageQueue.first();
                    if (fromQueue.length > this.consts.discordMessageLengthLimit) {
                        // if the line from the server is over 2000 chars then just remove it and don't care about it
                        server.messageQueue.shift();
                    }
                    else {
                        // if the new line in addition is too long then don't send it
                        if (message.length + fromQueue.length >
                            this.consts.discordMessageLengthLimit)
                            break;
                        message += `${server.messageQueue.shift()}\n`; // remove from queue if it is within limits
                    }
                }
                if (message.length) {
                    const channel = this.channels.cache.get(server.server.discordid);
                    if (channel.isText())
                        channel.send(message).then(() => (server.sendingMessage = false));
                }
                else {
                    server.sendingMessage = false;
                }
            });
        }, 100);
        this.factorioServers = servers_1.default;
        this.databaseCache = {
            users: new discord_js_1.Collection(),
            factorioServers: new discord_js_1.Collection(),
        };
        this.cache = {
            linkingCache: new node_cache_1.default({ stdTTL: 600 }),
        };
    }
    printDate(date) {
        return (0, moment_1.default)(new Date(date)).locale("UTC").format("hh:mm a, DD-MM-YYYY");
    }
    loadCommand(commandPath, commandName) {
        try {
            const props = new (require(`.${commandPath}${path_1.default.sep}${commandName}`))(this);
            props.conf.location = commandPath;
            if (props.init) {
                props.init(this);
            }
            this.commands.set(props.help.name, props);
            props.help.aliases.forEach((alias) => {
                this.aliases.set(alias, props.help.name);
            });
            return false;
        }
        catch (e) {
            return `Unable to load command ${commandName}: ${e}`;
        }
    }
    async unloadCommand(commandPath, commandName) {
        let command;
        if (this.commands.has(commandName)) {
            command = this.commands.get(commandName);
        }
        else if (this.aliases.has(commandName)) {
            command = this.commands.get(this.aliases.get(commandName));
        }
        if (!command) {
            return `The command \`${commandName}\` doesn't seem to exist, nor is it an alias. Try again!`;
        }
        return false;
    }
    async findOrCreateUser({ id: userID }) {
        if (this.databaseCache.users.get(userID)) {
            return this.databaseCache.users.get(userID);
        }
        else {
            let userData = await this.usersData.findOne({ id: userID });
            if (userData) {
                this.databaseCache.users.set(userID, userData);
                return userData;
            }
            else {
                userData = new this.usersData({ id: userID });
                await userData.save();
                this.databaseCache.users.set(userID, userData);
                return userData;
            }
        }
    }
    async findUserFactorioName(factorioname) {
        let userData = await this.usersData.findOne({ factorioName: factorioname });
        if (userData?.id)
            this.databaseCache.users.set(userData.id, userData);
        return userData;
    }
    emergencylog(message) {
        if (this.config.moderatorchannel) {
            const guild = this.guilds.cache.forEach((guild) => guild.channels.cache.forEach((channel) => channel.id === this.config.moderatorchannel && channel.isText() && channel.send(message)));
        }
    }
}
exports.default = Comfy;
//# sourceMappingURL=Comfy.js.map