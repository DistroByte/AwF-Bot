import { EventEmitter } from "events";
import { Tail } from "tail";
import servers from "../servers";
import { FactorioServer } from "../types";
import config from "../config";
import Comfy from "./Comfy";

export interface OutputData {
  line: string;
  server: FactorioServer;
}
export interface playerJoinData {
  line: { type: "join"; playerName: string };
  server: FactorioServer;
}
export interface playerLeaveData {
  line: { type: "leave"; playerName: string; reason: string };
  server: FactorioServer;
}

export declare interface TailEvents {
  ALL: (data: OutputData) => void;
  CHAT: (data: OutputData) => void;
  JLOGGER: (data: OutputData) => void;
  playerJoin: (data: playerJoinData) => void;
  playerLeave: (data: playerLeaveData) => void;
  out: (data: OutputData) => void;
  start: (data: OutputData) => void;
  logging: (data: OutputData) => void;
  datastore: (data: OutputData) => void;
  discord: (data: OutputData) => void;
}

declare interface tailListener {
  on<E extends keyof TailEvents>(event: E, listener: TailEvents[E]): this;
  off<E extends keyof TailEvents>(event: E, listener: TailEvents[E]): this;
  once<E extends keyof TailEvents>(event: E, listener: TailEvents[E]): this;
  emit<E extends keyof TailEvents>(
    event: E,
    ...args: Parameters<TailEvents[E]>
  ): boolean;
}

class tailListener extends EventEmitter {
  client: Comfy;
  private tailLocations: tailLocation[];
  constructor(tailLocations: tailLocation[]) {
    super();
    this.client = undefined;
    this.tailLocations = tailLocations;
    this.init();
  }
  init() {
    this.tailLocations.forEach((tailStuff) => {
      let tail = new Tail(tailStuff.path);
      tail.on("line", (line: string) => {
        const serverStartRegExp = new RegExp(
          /Info ServerMultiplayerManager.cpp:\d\d\d: Matching server connection resumed/
        );
        if (line.includes("[CHAT]"))
          this.client?.ws
            ? this.client.logger(`${tailStuff.server.name}: ${line}`)
            : console.log(`${tailStuff.server.name}: ${line}`);
        this.emit("ALL", { line: line, server: tailStuff.server });
        if (line.includes("[CHAT]") && !line.includes("<server>"))
          return this.emit("CHAT", { line: line, server: tailStuff.server });
        else if (line.includes("JLOGGER:"))
          return this.emit("JLOGGER", {
            line: line.slice(line.indexOf("JLOGGER:") + "JLOGGER:".length + 1),
            server: tailStuff.server,
          });
        else if (line.includes(`"join"`))
          return this.emit("playerJoin", {
            line: JSON.parse(line),
            server: tailStuff.server,
          });
        else if (line.includes(`"leave"`))
          return this.emit("playerLeave", {
            line: JSON.parse(line),
            server: tailStuff.server,
          });
        else if (serverStartRegExp.test(line))
          return this.emit("start", { line: line, server: tailStuff.server });
        else
          this.emit(tailStuff.type, {
            line: line,
            server: tailStuff.server,
          });
      });
    });
  }
}

interface tailLocation {
  path: string;
  server: FactorioServer;
  type: "out" | "logging" | "datastore" | "discord";
}

let tailLocations: tailLocation[] = [];
servers.forEach((server) => {
  if (server.toWatch.serverOut)
    tailLocations.push({
      path: `${config.serverpath}/${server.path}/${config.watchable.serverOut}`,
      server: server,
      type: "out",
    });
  if (server.toWatch.awfLogging)
    tailLocations.push({
      path: `${config.serverpath}/${server.path}/${config.watchable.awfLogging}`,
      server: server,
      type: "logging",
    });
  if (server.toWatch.datastore)
    tailLocations.push({
      path: `${config.serverpath}/${server.path}/${config.watchable.datastore}`,
      server: server,
      type: "datastore",
    });
  if (server.toWatch.discord)
    tailLocations.push({
      path: `${config.serverpath}/${server.path}/${config.watchable.discord}`,
      server: server,
      type: "discord",
    });
});

const listen = new tailListener(tailLocations);
export default listen;
