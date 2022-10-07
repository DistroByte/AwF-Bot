/**
 * @file FIFO handler for Factorio servers. Sends messages from Discord to Factorio and the like of that
 */

import { Message, Presence } from "discord.js";
import FactorioServers from "../servers"; // tails, fifo, discord IDs etc.
import { FactorioServer } from "../types";
import FIFO from "fifo-js";
import Comfy from "../base/Comfy";
import config from "../config";
const { serverpath } = config;

interface ServerFifo {
  serverFifo: FIFO;
  serverObject: FactorioServer;
}

/**
 * @classdesc FIFO handler for Factorio servers
 */
class ServerFifoManager {
  /**
   * @class Gets it's servers from the serversJS variable required from the .js file
   */
  usedFifos: ServerFifo[];
  unusedFifos: ServerFifo[];
  client: Comfy | null;
  constructor() {
    this.usedFifos = [];
    this.unusedFifos = [];
    this.client = undefined;
    FactorioServers.forEach((server) => {
      try {
        this.usedFifos.push({
          serverFifo: new FIFO(`${serverpath}/${server.path}/server.fifo`),
          serverObject: server,
        });
      } catch (error) {
        console.error(error);
      }
    });
  }
  /**
   * Check if the logging for the development server should be turned off. The presence given already needs to be checked for the correct user ID
   * @param {Presence} newPresence
   */
  checkDevServer(newPresence: Presence) {
    // test bot turned online
    if (newPresence.status != "offline") {
      this.usedFifos.forEach((server) => {
        if (server.serverObject.dev == true) {
          this.usedFifos = this.usedFifos.filter((currentFifo) => {
            if (!currentFifo.serverObject.dev) return currentFifo;
            if (currentFifo.serverObject.dev) {
              this.unusedFifos.push(currentFifo);
              this.client?.logger(
                "Turning dev server logging offline. Dev bot online",
                "debug"
              );
            }
          });
        }
      });
    }

    // test bot is now offline
    if (newPresence.status == "offline") {
      this.client?.logger(
        "Turning dev server logging online. Dev bot offline",
        "debug"
      );
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
    else toSend = `${message.cleanContent}`;
    toSend = toSend.replaceAll("`", "\\`");
    this.usedFifos.forEach((server) => {
      if (server.serverObject.discordid === message.channel.id)
        server.serverFifo.write(toSend, () => {});
    });
  }

  /**
   * Sends a message to all Factorio servers
   * @param {Message} message - Discord message to send to server
   * @param {boolean} [sendWithUsername=true] - Whether to send the message with username or not.
   */
  sendToAll(message: Message, sendWithUsername = true) {
    let toSend;
    if (sendWithUsername === true)
      toSend = `${message.author.username}: ${message.cleanContent}`;
    else toSend = `${message.cleanContent}`;
    toSend = toSend.replaceAll("`", "\\`");
    this.usedFifos.forEach((server) => {
      server.serverFifo.write(toSend, () => {});
    });
  }
}

let FifoManager = new ServerFifoManager();
export default FifoManager;
