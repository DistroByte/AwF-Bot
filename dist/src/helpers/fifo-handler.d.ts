/**
 * @file FIFO handler for Factorio servers. Sends messages from Discord to Factorio and the like of that
 */
import { Message, Presence } from "discord.js";
import { FactorioServer } from "../servers";
import FIFO from "fifo-js";
import Comfy from "../base/Comfy";
interface ServerFifo {
    serverFifo: FIFO;
    serverObject: FactorioServer;
}
/**
 * @classdesc FIFO handler for Factorio servers
 */
declare class ServerFifoManager {
    /**
     * @class Gets it's servers from the serversJS variable required from the .js file
     */
    usedFifos: ServerFifo[];
    unusedFifos: ServerFifo[];
    client: Comfy | null;
    constructor();
    /**
     * Check if the logging for the development server should be turned off. The presence given already needs to be checked for the correct user ID
     * @param {Presence} newPresence
     */
    checkDevServer(newPresence: Presence): void;
    /**
     * Sends a message to a Factorio server which has the same channel ID as the message
     * @param {Message} message - Discord message to send to server
     * @param {boolean} [sendWithUsername=true] - Whether to send the message with username or not.
     */
    sendToServer(message: any, sendWithUsername?: boolean): void;
    /**
     * Sends a message to all Factorio servers
     * @param {Message} message - Discord message to send to server
     * @param {boolean} [sendWithUsername=true] - Whether to send the message with username or not.
     */
    sendToAll(message: Message, sendWithUsername?: boolean): void;
}
declare let FifoManager: ServerFifoManager;
export default FifoManager;
