const rcon = require("./rcon")
const Tails = require("../base/Tails")
const serversJS = require("../servers")

// TODO: export to Prometheus

class _UPSHandler {
  constructor(servers) {
    this._processing = false
    this.servers = servers
    Object.keys(servers).forEach((serverKey) => {
      this.servers[serverKey].ups = 60
      this.servers[serverKey].playercount = 0
      this.servers[serverKey].previousTick = 0
      setTimeout(() => {
        rcon.rconCommand(`/sc global.ext = {}; rcon.print(#game.connected_players)`, this.servers[serverKey].discordid).then((output) => {
          try {
            this.servers[serverKey].playercount = parseInt(output)
          } catch { }
        }).catch(() => {})
      }, 2000) // wait for rcon to init
    })
    Tails.on("playerJoin", (log) => this.playerStuff(log))
    Tails.on("playerLeave", (log) => this.playerStuff(log))
    setInterval(() => {
      if (!this._processing)
        this.getData()
    }, 1000)
  }
  playerStuff(data) {
    const line = data.line
    const server = data.server
    if (line.type === "join") {
      Object.keys(this.servers).forEach((serverKey) => {
        if (this.servers[serverKey]?.discordid === server.discordid)
          this.servers[serverKey].playercount++
      })
    }
    if (line.type === "leave") {
      Object.keys(this.servers).forEach((serverKey) => {
        if (this.servers[serverKey]?.discordid === server.discordid)
          this.servers[serverKey].playercount--
      })
    }
  }
  async getData() {
    this._processing = true
    let promiseArray = this.servers.map(async (server) => {
      if (server.playercount !== 0) {
        let response = await rcon.rconCommand("/sc rcon.print(game.tick)", server.discordid)
        try {
          server.ups = Math.abs(server.previousTick - parseInt(response))
          server.previousTick = parseInt(response)
        } catch {}
      }
      rcon.rconCommand(`/sc global.ext.var = game.json_to_table('${JSON.stringify({ server_ups: server.ups, ext: []})}')`, server.discordid).then(() => {}).catch(() => {})
      return server
    })
    this.servers = await Promise.all(promiseArray)
    this._processing = false
    return this.servers
  }
}

const UPSHandler = new _UPSHandler(serversJS)
module.exports = UPSHandler