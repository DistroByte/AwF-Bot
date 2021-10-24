/**
 * @file Handles UPS
 */
import rcon from "./rcon";
import Tails, { playerJoinData, playerLeaveData } from "../base/Tails";
import serversJS from "../servers";
import { FactorioServer } from "../types";
import discord from "discord.js";

// Known issue: servers will report a UPS of 0 if the bot starts and nobody is online on the server

interface UPSServer extends FactorioServer {
  ups: number;
  previousTick: number;
  playercount: number;
}

/**
 * @classdesc UPS handler, generates data that can be fetched. Doesn't historically store it
 */
class UPSManager {
  private servers: UPSServer[];
  private _processing: boolean;
  constructor(servers: FactorioServer[]) {
    this._processing = false;
    this.servers = servers.map((server) => {
      return {
        ...server,
        playercount: 0,
        ups: 0,
        previousTick: 0,
      };
    });
    Object.keys(servers).forEach((serverKey) => {
      this.servers[serverKey].ups = 0;
      this.servers[serverKey].playercount = 0;
      this.servers[serverKey].previousTick = 0;
      setTimeout(() => {
        rcon
          .rconCommand(
            `/sc global.ext = {}; rcon.print(#game.connected_players)`,
            this.servers[serverKey].discordid
          )
          .then((output) => {
            try {
              this.servers[serverKey].playercount = parseInt(output.resp);
            } catch {}
          })
          .catch(() => {});
      }, 2000); // wait for rcon to init
    });
    Tails.on("playerJoin", (log) => this.playerStuff(log));
    Tails.on("playerLeave", (log) => this.playerStuff(log));
    setInterval(() => {
      if (!this._processing) this.getData();
    }, 1000);
  }

  get processing() {
    return this._processing;
  }

  playerStuff(data: playerJoinData | playerLeaveData) {
    const line = data.line;
    const server = data.server;
    if (line.type === "join") {
      Object.keys(this.servers).forEach((serverKey) => {
        if (this.servers[serverKey]?.discordid === server.discordid)
          this.servers[serverKey].playercount++;
      });
    }
    if (line.type === "leave") {
      Object.keys(this.servers).forEach((serverKey) => {
        if (this.servers[serverKey]?.discordid === server.discordid)
          this.servers[serverKey].playercount--;
      });
    }
  }
  private async getData() {
    this._processing = true;
    let promiseArray = this.servers.map(async (server) => {
      if (server.playercount !== 0) {
        try {
          let response = await rcon
            .rconCommand("/sc rcon.print(game.tick)", server.discordid)
            .catch(() => {});
          if (response) {
            server.ups = Math.abs(
              server.previousTick - parseInt(response.resp)
            );
            server.previousTick = parseInt(response.resp);
          }
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
    this.servers = serversUpdated;
    this._processing = false;
  }
  /**
   * Get current data for handling
   * @returns {UPS[]} - Collected data
   */
  exportData(): UPSServer[] {
    return this.servers;
  }
}

const UPSHandler = new UPSManager(serversJS);
export default UPSHandler;
