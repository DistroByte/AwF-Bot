const { rconport, rconpw } = require("../botconfig.json");
const Rcon = require("rcon-client");
const serversJSON = require("../servers.json");
const { Message, MessageEmbed } = require("discord.js");

/**
 * @class
 * @classdesc Manages all RCON connections to Factorio servers
 */
class _RconConnectionManager {
    constructor() {
        // [{connection: rconConnection, serverObject: serverObjectFromServersJSON}]
        this._rconConnections = []
        this._createRcon();
    }
    /**
     * @description Creates all RCON connections to servers from scratch, i.e. if they stop working/should be reset
     */
    async _createRcon() {
        this._rconConnections = [];
        Object.keys(serversJSON).forEach(async (serverKey) => {
            const port = parseInt(rconport) + parseInt(serversJSON[serverKey].rconPortOffset);
            const rcon = new Rcon.Rcon({
                host: "127.0.0.1",
                port: `${port}`,
                password: `${rconpw}`,
            });
            await rcon.connect();
            this._rconConnections.push({
                connection: rcon,
                serverObject: serversJSON[serverKey]
            });
            rcon.on('connect', () => {
                console.log(`Server ${serversJSON[serverKey].name}: RCON connected`);
            });
            rcon.on('error', () => {
                console.error(`Server ${serversJSON[serverKey].name}: RCON error. Attempting reconnect in 30s`);
                setTimeout(async () => {
                    await rcon.connect();
                }, 30000);
            })
            rcon.on('end', () => {
                console.error(`Server ${serversJSON[serverKey].name}: RCON connection died. Attempting reconnect in 30s`);
                setTimeout(async () => {
                    await rcon.connect();
                }, 30000);
            });
        });
    }

    /**
     * @description Closes all RCON connecetion and then re-instates them
     * @see {@link _createRcon}
     */
    refreshRcon() {
        this._rconConnections.filter(server => {
            server.connection.end();
        });
        this._rconConnections = [];
        this._createRcon();
    }

    /**
     * @async
     * @description Sends a Factorio command to RCON.
     * @param {string} command - Command to send to the server (auto-prefixed with '/')
     * @param {string} serverName - Server identifier, such as server name, channel ID or channel name
     * @returns {string[]} Returns an array with 2 elements, first being command output (string). Second element is either a blank string, or a string beginning with "error:" and containing the error given
     * @example
     * // sends /time to server with name TEST in servers.json
     * // returns ["2 days, 28 minutes and 1 second", ""] when succesfull
     * // returns ["", "error: stuff"] when unsuccesfull
     * rconCommand(`/time`, "TEST")
     */
    async rconCommand(command, serverIdentifier) {
        if (!command.startsWith("/")) command = `/${command}`;
        let server = undefined;
        this._rconConnections.forEach(serverConnections => {
            if ([serverConnections.serverObject.name, serverConnections.serverObject.discordChannelID, serverConnections.serverObject.discordChannelName].some((identifier) => identifier === serverIdentifier))
                server = serverConnections;
        });
        if (server == undefined) {
            console.error(`Server with identifier ${serverIdentifier} couldn't be found`);
            throw new Error("Server couldn't be found");
        }
        try {
            let resp = await server.connection.send(command);
            if (typeof resp == "string" && resp.length) return resp;
            else throw new Error("No length");
        } catch (error) {
            console.error(
                `RCON Error --- Details --- \nNAME: ${err.name} \nDESC: ${err.description} \nStack: ${err.stack}`
            );
            return error;
        }
    }

    /**
     * @async
     * @description Like the function rconCommand but sends the RCON command to all servers
     * @param {string} command - Command to send to server (auto prefixed with '/')
     * @returns {Array<string, string>} Returns an array of command outputs (strings), with the command outputs being same as {@link rconCommand}. Example return is [["2 days, 28 minutes and 1 second", ""], "CORE"]
     * @see {@link rconCommand} to see how the RCON commands work
     * @example
     * // sends /time to all servers
     * // returns [[["2 days, 28 minutes and 1 second", ""], "CORE"], [["19 days, 5 minutes and 1 second", ""], "AWF-REG"]]
     * // the number of returns and return values depends on the number of servers and age of servers respectively
     * await rconCommandAll("/time")
     */
    async rconCommandAll(command) {
        let promiseArray = this._rconConnections.map(async (server) => {
            return new Promise(async (resolve, reject) => {
                const resultIdentifier = {
                    name: server.serverObject.name,
                    discordChannelID: server.serverObject.discordChannelID,
                    discordChannelName: server.serverObject.discordChannelName,
                }
                this.rconCommand(command, server.serverObject.discordChannelID)
                    .then(res => resolve([res, resultIdentifier]))
                    .catch(e => reject([e, resultIdentifier]))
            })
        })
        return await Promise.all(promiseArray);
    }

    async rconCommandAllExclude(command, exclusionServerIdentifiers) {
        if (!command.startsWith("/")) command = `/${command}`; //add a '/' if not present

        const getArrayOverlap = (array1, array2) => {
            return array1.filter(x => array2.indexOf(x) !== -1);
        }

        let overlap = [];
        let nameArr = this._rconConnections.map((connection) => { return connection.serverObject.name });
        let channelIDArr = this._rconConnections.map((connection) => { return connection.serverObject.discordChannelID });
        let channelNameArr = this._rconConnections.map((connection) => { return connection.serverObject.discordChannelName });
        overlap.push(...getArrayOverlap(exclusionServerIdentifiers, nameArr));
        overlap.push(...getArrayOverlap(exclusionServerIdentifiers, channelIDArr));
        overlap.push(...getArrayOverlap(exclusionServerIdentifiers, channelNameArr));

        let toRun = [];
        this._rconConnections.forEach(connection => {
            if (overlap.includes(connection.serverObject.name) ||
                overlap.includes(connection.serverObject.discordChannelID) ||
                overlap.includes(connection.serverObject.discordChannelName)) return
            else
                toRun.push(connection);
        });

        let promiseArray = toRun.map((connection) => {
            return new Promise((resolve, reject) => {
                const resultIdentifier = {
                    name: connection.serverObject.name,
                    discordChannelID: connection.serverObject.discordChannelID,
                    discordChannelName: connection.serverObject.discordChannelName,
                }
                this.rconCommand(command, connection.serverObject.discordChannelID)
                    .then(res => resolve([res, resultIdentifier]))
                    .catch(e => reject([e, resultIdentifier]))
            });
        });
        return await Promise.all(promiseArray);
    }
}

let RconConnectionManager = new _RconConnectionManager();

module.exports = {
    RconConnectionManager,
}