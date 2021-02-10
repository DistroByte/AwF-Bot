const { Presence } = require("discord.js")
const serversJSON = require("../servers.json"); // tails, fifo, discord IDs etc.
const FIFO = require("fifo-js");

/**
 * This class manages the FIFO files for all servers, with their respective features for sending messages
 * @class
 * @constructor
 * @public
 */
class _ServerFifoManager {
    constructor () {
        this.usedFifos = [];
        this.unusedFifos = [];
        let serverKeys = Object.keys(serversJSON);
        serverKeys.forEach((server) => {
            /**
             * This is an array of all used FIFOs in the class. They are retrieved from the servers.json file
             */
            try {
                this.usedFifos.push({
                    serverFifo: new FIFO(serversJSON[server].serverFifo),
                    serverObject: serversJSON[server],
                });
            } catch (error) {
                console.error(error);
            }
        });
    }
    /**
     * Turns logging on/off for development server if the bot turns offline/online to prevent errors
     * @param {Presence} newPresence - Discord presence of the testing/development bot
     */
    checkDevServer(newPresence) {
        // test bot turned online
        if (newPresence.status != "offline") {
            this.usedFifos.forEach((server) => {
                if (server.serverObject.dev == true) {
                    this.usedFifos = this.usedFifos.filter((currentFifo) => {
                        if (!currentFifo.serverObject.dev)
                            return currentFifo;
                        if (currentFifo.serverObject.dev)
                            this.unusedFifos.push(currentFifo);
                    });
                }
            });
        }

        // test bot is now offline
        if (newPresence.status == "offline") {
            this.unusedFifos = this.unusedFifos.filter((currentFifo) => {
                this.usedFifos.push(currentFifo);
            })
        }
    }

    /**
     * @description Sends a message to only one server
     * @param {Object} message - Discord message object to send to Factorio server. Used for which server to send to by getting the server by channel ID
     * @param {bool} sendWithUsername - Whether to send with username or not
     */
    sendToServer(message, sendWithUsername) {
        let toSend;
        if (sendWithUsername === true)
            toSend = `${message.author.username}: ${message.content}`
        else
            toSend = `${message.content}`
        this.usedFifos.forEach((server) => {
            if (server.serverObject.discordChannelID === message.channel.id)
                server.serverFifo.write(toSend, () => {});
        });
        return;
    }
    /**
     * @description Send a message to all servers (announcement or something)
     * @param {Object} message - Message to send, format of DiscordMessage
     * @param {bool} sendWithUsername - Whether to send message with username or not
     */
    sendToAll(message, sendWithUsername) {
        let toSend;
        if (sendWithUsername === true)
            toSend = `${message.author.username}: ${message.content}`
        else
            toSend = `${message.content}`
        this.usedFifos.forEach((server) => {
            server.serverFifo.write(toSend, () => {});
        });
    }
}

let ServerFifoManager = new _ServerFifoManager()
module.exports = {
    ServerFifoManager,
}