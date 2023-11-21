/**
 * @file RCON client manager for servers
 */
import { Rcon } from "rcon-client";
import config from "../config";
import { FactorioServer } from "../types";
import Comfy from "../base/Comfy";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import servers from "../servers";

dayjs.extend(relativeTime);
const { rconport, rconpw, errorchannel } = config;

interface RCONCommandSuccessOutput {
  resp: string;
  server: FactorioServer;
}
interface RCONCommandFailOutput {
  resp: false;
  identifier: string;
}
type RCONCommandOutput = RCONCommandSuccessOutput | RCONCommandFailOutput;

interface Connection {
  rcon: Rcon;
  server: FactorioServer;
  hasScenario: boolean;
}

class RconInterface {
  public servers: FactorioServer[];
  public client: Comfy | null;
  public rconConnections: Connection[];
  /**
   * Intervals of checking if a server is online
   */
  private checkIntervals: Map<string, NodeJS.Timeout> = new Map();

  public onServerConnected: (server: FactorioServer) => void;

  constructor(servers: FactorioServer[]) {
    this.servers = servers;
    this.rconConnections = [];

    this.servers.map((_, i) => this.initServer(i));
    this.onServerConnected = () => {};
  }

  private async initServer(serverIndex: number) {
    const server = this.servers[serverIndex];
    if (!server) return;
    const rcon = new Rcon({
      host: "127.0.0.1",
      port: server.rconoffset + rconport,
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
        server: server,
        hasScenario: hasScenario,
      });
      this.onServerConnected(server);

      // reconnection mechanism
      rcon.on("end", () => {
        this.reconnectRcon(rcon, server); // start the reconnection mechanism
        if (!server.dev) {
          this.client.sendToErrorChannel(
            `Server <#${
              server.discordid
            }> has dropped connection to RCON at <t:${Math.floor(
              Date.now() / 1000
            )}>`
          );
        }
      });
    } catch (error) {
      // mechanism to reconnect to RCON after some time
      this.reconnectRcon(rcon, server); // start the reconnection mechanism
      if (!server.dev) {
        this.client.sendToErrorChannel(
          `Server <#${
            server.discordid
          }> has failed to initially connect to RCON at <t:${Math.floor(
            Date.now() / 1000
          )}>`
        );
      }
    }
  }

  /**
   * RCON server reconnection mechanism
   */
  private reconnectRcon(rcon: Rcon, server: FactorioServer) {
    // amount of seconds passed = amount of attempts * 15
    const attempts = [2, 4, 20, 40, 60, 120, 240, 720, 1440, 2880, 5760];

    let connectionAttempts = 0;
    const startedAt = Date.now();
    const checkOnline = async () => {
      try {
        await rcon.connect();

        // if the server is online, remove the interval
        const interval = this.checkIntervals.get(server.name);
        if (interval) {
          clearInterval(interval);
          this.checkIntervals.delete(server.name);
        }

        // if the connection was successful, it would not error
        // if it failed, it would throw and be caught in the catch block
        this.client.sendToErrorChannel(
          `Server <#${
            server.discordid
          }> has reconnected to RCON at <t:${Math.floor(
            Date.now() / 1000
          )}>, after ${dayjs(startedAt).fromNow(true)}. Synchronizing banlist`
        );
        this.onServerConnected(server);
        return;
      } catch {
        connectionAttempts++;
        // if the amount of connection attempts is equal to 48h, then set it to 1d to send the message again
        if (connectionAttempts === 11520) connectionAttempts = 5760;
        // dayjs is used to get the relative time since the start of the reconnection attempts
        if (attempts.includes(connectionAttempts)) {
          if (!server.dev) {
            this.client.sendToErrorChannel(
              `Server <#${
                server.discordid
              }> has dropped connection to RCON at <t:${Math.floor(
                Date.now() / 1000
              )}>`
            );
          }
        }
      }
    };
    const interval = setInterval(checkOnline, 15 * 1000);
    this.checkIntervals.set(server.name, interval);
  }

  /**
   * Send a RCON command to a specific server
   * @param command RCON command, automatically is prefixed with / if it is not provided
   * @param serverIdentifier Server name or Discord channel ID to find server with
   */
  async rconCommand(
    command: string,
    serverIdentifier: string
  ): Promise<RCONCommandOutput> {
    command = command.startsWith("/") ? command : `/${command}`;
    const server = this.rconConnections.find(
      (s) =>
        s.server.name === serverIdentifier ||
        s.server.discordid === serverIdentifier
    );
    // if (serverIdentifier == "724696348871622818")
    // 	console.log(server)
    if (!server)
      return {
        resp: false,
        identifier: serverIdentifier,
      };
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const response = await server.rcon.send(command).catch(() => {});
    if (!response)
      return {
        resp: false,
        identifier: serverIdentifier,
      };
    return {
      resp: response,
      server: server.server,
    };
  }

  /**
   * Send a command to all servers
   */
  async rconCommandAll(command: string): Promise<RCONCommandOutput[]> {
    command = command.startsWith("/") ? command : `/${command}`;
    const responses = await Promise.all(
      this.servers.map(async (server) => {
        const response = await this.rconCommand(command, server.name);
        return response;
      })
    );
    return responses;
  }

  async rconCommandAllExclude(
    command: string,
    exclude: string[]
  ): Promise<RCONCommandOutput[]> {
    command = command.startsWith("/") ? command : `/${command}`;
    const responses = await Promise.all(
      this.servers
        .filter((server) => {
          if (exclude.includes(server.name)) return false;
          if (exclude.includes(server.discordname)) return false;
          if (exclude.includes(server.discordid)) return false;
          return true;
        })
        .map((server) => this.rconCommand(command, server.name))
    );
    return responses;
  }

  get offlineServerCount() {
    return this.checkIntervals.size;
  }
}

const rcon = new RconInterface(servers);
export default rcon;
