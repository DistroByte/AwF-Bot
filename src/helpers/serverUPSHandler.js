/**
 * @file Handles UPS
 */
const rcon = require("./rcon");
const Tails = require("../base/Tails");
const serversJS = require("../servers");
const discord = require("discord.js");

// Known issue: servers will report a UPS of 0 if the bot starts and nobody is online on the server

/**
 * @typedef {Object} UPS
 * @property {discord.Snowflake} discordid - Server's Discord channel ID
 * @property {String} discordname - Server's Discord channel name
 * @property {Number} ups - Server's last measured UPS
 * @property {Number} previousTick - Server's last measured gametick
 * @property {Number} playercount - Number of players on the server
 */

/**
 * @classdesc UPS handler, generates data that can be fetched. Doesn't historically store it
 */
class _UPSHandler {
  /**
   * @param {Object[]} servers - Array of servers from servers.js
   */
  constructor(servers) {
    this._processing = false;
    this._servers = servers;
    Object.keys(servers).forEach((serverKey) => {
      this._servers[serverKey].ups = 0;
      this._servers[serverKey].playercount = 0;
      this._servers[serverKey].previousTick = 0;
      setTimeout(() => {
        rcon
          .rconCommand(
            `/sc global.ext = {}; rcon.print(#game.connected_players)`,
            this._servers[serverKey].discordid
          )
          .then((output) => {
            try {
              this._servers[serverKey].playercount = parseInt(output.resp);
            } catch {}
          })
          .catch(() => {});
      }, 2000); // wait for rcon to init
    });
    Tails.on("playerJoin", (log) => this._playerStuff(log));
    Tails.on("playerLeave", (log) => this._playerStuff(log));
    setInterval(() => {
      if (!this._processing) this._getData();
    }, 1000);
  }
  _playerStuff(data) {
    const line = data.line;
    const server = data.server;
    if (line.type === "join") {
      Object.keys(this._servers).forEach((serverKey) => {
        if (this._servers[serverKey]?.discordid === server.discordid)
          this._servers[serverKey].playercount++;
      });
    }
    if (line.type === "leave") {
      Object.keys(this._servers).forEach((serverKey) => {
        if (this._servers[serverKey]?.discordid === server.discordid)
          this._servers[serverKey].playercount--;
      });
    }
  }
  async _getData() {
    this._processing = true;
    let promiseArray = this._servers.map(async (server) => {
      if (server.playercount !== 0) {
        try {
          let response = await rcon
            .rconCommand("/sc rcon.print(game.tick)", server.discordid)
            .catch(() => {});
          server.ups = Math.abs(server.previousTick - parseInt(response.resp));
          server.previousTick = parseInt(response.resp);
        } catch {}
        try {
          rcon
            .rconCommand(
              `/sc global.ext = game.json_to_table('${JSON.stringify({
                var: {
                  server_ups: server.ups,
                  status: "Online",
                },
                servers: [
                  {
                    name: "All-Weekend Factorio",
                    welcome: "Welcome to All-Weekend Factorio servers!",
                    reset_time: "Depends on server",
                    branch: "Unknown",
                  },
                ],
                current: 1,
              })}')`,
              server.discordid
            )
            .then(() => {})
            .catch(() => {});
        } catch {}
      }
      return server;
    });
    let serversUpdated = await Promise.all(promiseArray);
    this._servers = serversUpdated;
    this._processing = false;
  }
  /**
   * Get current data for handling
   * @returns {UPS[]} - Collected data
   */
  exportData() {
    return this._servers;
  }
}

const UPSHandler = new _UPSHandler(serversJS);
module.exports = UPSHandler;
