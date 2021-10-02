"use strict";
/**
 * @file FIFO handler for Factorio servers. Sends messages from Discord to Factorio and the like of that
 */
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const servers_1 = (0, tslib_1.__importDefault)(require("../servers")); // tails, fifo, discord IDs etc.
const fifo_js_1 = (0, tslib_1.__importDefault)(require("fifo-js"));
const config_1 = (0, tslib_1.__importDefault)(require("../config"));
const { serverpath } = config_1.default;
/**
 * @classdesc FIFO handler for Factorio servers
 */
class ServerFifoManager {
    constructor() {
        this.usedFifos = [];
        this.unusedFifos = [];
        this.client = undefined;
        servers_1.default.forEach((server) => {
            try {
                this.usedFifos.push({
                    serverFifo: new fifo_js_1.default(`${serverpath}/${server.path}/server.fifo`),
                    serverObject: server,
                });
            }
            catch (error) {
                console.error(error);
            }
        });
    }
    /**
     * Check if the logging for the development server should be turned off. The presence given already needs to be checked for the correct user ID
     * @param {Presence} newPresence
     */
    checkDevServer(newPresence) {
        // test bot turned online
        if (newPresence.status != "offline") {
            this.usedFifos.forEach((server) => {
                if (server.serverObject.dev == true) {
                    this.usedFifos = this.usedFifos.filter((currentFifo) => {
                        if (!currentFifo.serverObject.dev)
                            return currentFifo;
                        if (currentFifo.serverObject.dev) {
                            this.unusedFifos.push(currentFifo);
                            this.client?.logger("Turning dev server logging offline. Dev bot online", "debug");
                        }
                    });
                }
            });
        }
        // test bot is now offline
        if (newPresence.status == "offline") {
            this.client?.logger("Turning dev server logging online. Dev bot offline", "debug");
            this.unusedFifos = this.unusedFifos.filter((currentFifo) => {
                this.usedFifos.push(currentFifo);
            });
        }
    }
    /**
     * Sends a message to a Factorio server which has the same channel ID as the message
     * @param {Message} message - Discord message to send to server
     * @param {boolean} [sendWithUsername=true] - Whether to send the message with username or not.
     */
    sendToServer(message, sendWithUsername = true) {
        let toSend;
        if (sendWithUsername === true)
            toSend = `${message.author.username}: ${message.cleanContent}`;
        else
            toSend = `${message.cleanContent}`;
        this.usedFifos.forEach((server) => {
            if (server.serverObject.discordid === message.channel.id)
                server.serverFifo.write(toSend, () => { });
        });
    }
    /**
     * Sends a message to all Factorio servers
     * @param {Message} message - Discord message to send to server
     * @param {boolean} [sendWithUsername=true] - Whether to send the message with username or not.
     */
    sendToAll(message, sendWithUsername = true) {
        let toSend;
        if (sendWithUsername === true)
            toSend = `${message.author.username}: ${message.cleanContent}`;
        else
            toSend = `${message.cleanContent}`;
        this.usedFifos.forEach((server) => {
            server.serverFifo.write(toSend, () => { });
        });
    }
}
let FifoManager = new ServerFifoManager();
exports.default = FifoManager;
//# sourceMappingURL=fifo-handler.js.map