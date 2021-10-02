const { EventEmitter } = require("events");
const { Tail } = require("tail");
const servers = require("../servers");
const config = require("../config");

class tailListener extends EventEmitter {
  constructor(tailLocations) {
    super();
    this.client = undefined;
    this._tailLocations = tailLocations;
    this.init();
  }
  init() {
    this._tailLocations.forEach((tailStuff) => {
      let tail = new Tail(tailStuff.path);
      tail.on("line", (line) => {
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
          this.emit(tailStuff.type || "line", {
            line: line,
            server: tailStuff.server,
          });
      });
    });
  }
}

let tailLocations = [];
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
module.exports = listen;
