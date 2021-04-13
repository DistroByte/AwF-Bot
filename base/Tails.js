const { EventEmitter } = require("events")
const { Tail } = require("tail")
const servers = require("../servers")
const config = require("../config")

class tailListener extends EventEmitter {
  constructor(tailLocations) {
    super()
    this._tailLocations = tailLocations
    this.init()
  }
  init() {
    this._tailLocations.forEach((tailStuff) => {
      let tail = new Tail(tailStuff.path)
      tail.on('line', (line) => {
        console.log(line)
        if (line.includes("[CHAT]")) console.log(line)
        if (line.includes(`"join"`)) console.log(line)
        if (line.includes(`"leave"`)) console.log(line)
        this.emit("ALL", { line: line, server: tailStuff.server })
        if (line.includes("[CHAT]") && !line.includes("<server>"))
          return this.emit("CHAT", { line: line, server: tailStuff.server })
        else if (line.includes("JLOGGER:"))
          return this.emit("JLOGGER", { line: line.slice(line.indexOf("JLOGGER:") + "JLOGGER:".length + 1), server: tailStuff.server })
        else if (line.includes(`"join"`))
          return this.emit("playerJoin", { line: JSON.parse(line), server: tailStuff.server })
        else if (line.includes(`"leave"`))
          return this.emit("playerLeave", { line: JSON.parse(line), server: tailStuff.server })
        else this.emit(tailStuff.type || "line", { line: line, server: tailStuff.server })
      })
    })
  }
}

let tailLocations = []
servers.forEach((server) => {
  if (server.toWatch.serverOut)
    tailLocations.push({ path: `${config.serverpath}/${server.path}/${config.watchable.serverOut}`, server: server, type: "out" })
  if (server.toWatch.awfLogging)
    tailLocations.push({ path: `${config.serverpath}/${server.path}/${config.watchable.awfLogging}`, server: server, type: "logging" })
  if (server.toWatch.datastore)
    tailLocations.push({ path: `${config.serverpath}/${server.path}/${config.watchable.datastore}`, server: server, type: "datastore" })
})

const listen = new tailListener(tailLocations)
module.exports = listen