/**
 * @file RCON client manager for servers
 */
import { Rcon } from "rcon-client";
import config from "../config";
import servers, { FactorioServer } from "../servers";
import discord from "discord.js";
import Comfy from "../base/Comfy";
const { rconport, rconpw, errorchannel } = config;

interface RCONCommandOutput {
  resp: string;
  server: FactorioServer;
}

class rconInterface {
  /**
   * RCON interface for servers
   * @param {Object[]} rconConfig - Array of RCON configs
   * @param {number} rconConfig.rconport - Port of RCON
   * @param {Object} rconConfig.server - Server object from {@link ../servers.js}
   * @param {string} pw - RCON password - Same for all servers
   */
  private rconConfig: {
    rconport: number;
    server: FactorioServer;
  }[];
  public rconConnections: {
    rcon: Rcon;
    server: FactorioServer;
    hasScenario: boolean;
  }[];
  _client: Comfy;
  constructor(rconConfig, pw) {
    this.rconConfig = rconConfig;
    this.rconConnections = [];
    this._init();
    this._client = undefined;
  }
  _init() {
    if (!this.rconConfig) return console.log("no config");
    this.rconConfig.forEach(async (server) => {
      let rcon = new Rcon({
        host: "localhost",
        port: server.rconport,
        password: rconpw,
      });
      try {
        await rcon.connect();
        const getServerUps = await rcon.send("/interface 1");
        const hasScenario = getServerUps.includes("Command Complete")
          ? true
          : false;
        this.rconConnections.push({
          rcon: rcon,
          server: server.server,
          hasScenario: hasScenario,
        });

        // reconnection mechanism
        rcon.on("end", () => {
          let i = 0;
          const interval = setInterval(async () => {
            try {
              rcon
                .connect()
                .then(() => {
                  clearInterval(interval);
                  this._client?.channels
                    .fetch(errorchannel)
                    .then(
                      (channel) =>
                        channel.isText() &&
                        channel.send(
                          `Server <#${server.server.discordid}> has connected to RCON`
                        )
                    );
                })
                .catch(() => {});
              i++;
              if (i === 60) {
                // 5 minutes
                // clearInterval(interval) // just keep trying to reconnect
                this._client?.channels
                  .fetch(errorchannel)
                  .then(
                    (channel) =>
                      channel.isText() &&
                      channel.send(
                        `Server <#${server.server.discordid}> is having RCON issues`
                      )
                  );
              }
            } catch (error) {}
          }, 5000);
        });
      } catch (error) {
        console.error(error);
        const errorSend = setInterval(() => {
          this._client?.channels
            ?.fetch(errorchannel)
            .then(
              (channel) =>
                channel.isText() &&
                channel?.send(
                  `Server <#${server.server.discordid}> is having RCON issues`
                )
            )
            .then(() => clearInterval(errorSend))
            .catch(() => {});
        }, 1000);
        let i = 0;
        const interval = setInterval(async () => {
          try {
            rcon
              .connect()
              .then(() => {
                clearInterval(interval);
                this._client?.channels
                  .fetch(errorchannel)
                  .then(
                    (channel) =>
                      channel.isText() &&
                      channel.send(
                        `Server <#${server.server.discordid}> has connected to RCON`
                      )
                  );
              })
              .catch(() => {});
            i++;
            if (i === 60) {
              // 5 minutes
              // clearInterval(interval) // just keep trying to reconnect
              this._client?.channels
                .fetch(errorchannel)
                .then(
                  (channel) =>
                    channel.isText() &&
                    channel.send(
                      `Server <#${server.server.discordid}> is having RCON issues`
                    )
                );
            }
          } catch (error) {}
        }, 5000);
      }
    });
  }
  /**
   * Send a RCON command to a Factorio server
   * @param {} command - Command to send to the server. Automatically prefixed with /
   * @param {} serverIdentifier - Identifier for server. Either server's Discord channel ID, Discord name or debug name
   * @returns {} RCON output or error. Can be "Server couldn't be found" if no server was found
   */
  async rconCommand(
    command: string,
    serverIdentifier: string
  ): Promise<RCONCommandOutput> {
    if (!command.startsWith("/")) command = `/${command}`;
    let server = undefined;
    this.rconConnections.forEach((serverConnections) => {
      if (
        [
          serverConnections.server.name,
          serverConnections.server.discordid,
          serverConnections.server.discordname,
        ].some((identifier) => identifier === serverIdentifier)
      )
        server = serverConnections;
    });
    if (server == undefined) {
      throw new Error("Server couldn't be found");
    }
    try {
      let resp = await server.rcon.send(command);
      if (typeof resp == "string" && resp.length)
        return { resp: resp, server: server.server };
    } catch (error) {
      return { resp: error, server: server.server };
    }
  }
  /**
   * Send a RCON command to all Factorio servers
   * @param {string} command - Command to send to the servers. Automatically prefixed with /
   * @returns {} RCON output of all servers
   */
  async rconCommandAll(command: string): Promise<RCONCommandOutput[]> {
    let promiseArray: Promise<RCONCommandOutput>[] = this.rconConnections.map(
      async (server) => {
        return new Promise(async (resolve, reject) => {
          const resultIdentifier = {
            name: server.server.name,
            discordid: server.server.discordid,
            discordname: server.server.discordname,
          };
          this.rconCommand(command, server.server.discordid)
            .then((res) => resolve({ resp: res.resp, server: res.server }))
            .catch((e) => reject({ resp: e, server: resultIdentifier }));
        });
      }
    );
    return await Promise.all(promiseArray);
  }
  /**
   * Send a RCON command to all Factorio servers except the one you specify
   * @param {} command - Command to send to the servers. Automatically prefixed with /
   * @param {} exclusionServerIdentifiers - Identifier of server to exclude
   * @returns {Promise<RCONOutput[]>} RCON output of servers
   */
  async rconCommandAllExclude(
    command: string,
    exclusionServerIdentifiers: string
  ): Promise<RCONCommandOutput[]> {
    if (!command.startsWith("/")) command = `/${command}`; //add a '/' if not present

    const getArrayOverlap = (array1, array2) => {
      return array1.filter((x) => array2.indexOf(x) !== -1);
    };

    let overlap = [];
    let nameArr = this.rconConnections.map((connection) => {
      return connection.server.name;
    });
    let channelIDArr = this.rconConnections.map((connection) => {
      return connection.server.discordid;
    });
    let channelNameArr = this.rconConnections.map((connection) => {
      return connection.server.discordname;
    });
    overlap.push(...getArrayOverlap(exclusionServerIdentifiers, nameArr));
    overlap.push(...getArrayOverlap(exclusionServerIdentifiers, channelIDArr));
    overlap.push(
      ...getArrayOverlap(exclusionServerIdentifiers, channelNameArr)
    );

    let toRun = [];
    this.rconConnections.forEach((connection) => {
      if (
        overlap.includes(connection.server.name) ||
        overlap.includes(connection.server.discordid) ||
        overlap.includes(connection.server.discordname)
      )
        return;
      else toRun.push(connection);
    });

    let promiseArray: Promise<RCONCommandOutput>[] = toRun.map((connection) => {
      return new Promise((resolve, reject) => {
        const resultIdentifier = {
          name: connection.server.name,
          discordid: connection.server.discordid,
          discordname: connection.server.discordname,
        };
        this.rconCommand(command, connection.server.discordid)
          .then((res) => resolve({ resp: res.resp, server: res.server }))
          .catch((e) => reject({ resp: e, server: resultIdentifier }));
      });
    });
    return await Promise.all(promiseArray);
  }
}
const rconPorts = servers.map((server) => {
  return {
    rconport: server.rconoffset + rconport,
    server: server,
  };
});
const rcon = new rconInterface(rconPorts, rconpw);
export default rcon;
