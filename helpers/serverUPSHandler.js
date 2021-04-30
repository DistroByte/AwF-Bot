const rcon = require("./rcon")
const Tails = require("../base/Tails")
const serversJS = require("../servers")

// Known issue: servers will report a UPS of 0 if the bot starts and nobody is online on the server

class _UPSHandler {
  constructor(servers) {
    this._processing = false
    this._servers = servers
    Object.keys(servers).forEach((serverKey) => {
      this._servers[serverKey].ups = 0
      this._servers[serverKey].playercount = 0
      this._servers[serverKey].previousTick = 0
      setTimeout(() => {
        rcon.rconCommand(`/sc global.ext = {}; rcon.print(#game.connected_players)`, this._servers[serverKey].discordid).then((output) => {
          try {
            this._servers[serverKey].playercount = parseInt(output)
          } catch { }
        }).catch(() => {})
      }, 2000) // wait for rcon to init
    })
    Tails.on("playerJoin", (log) => this._playerStuff(log))
    Tails.on("playerLeave", (log) => this._playerStuff(log))
    setInterval(() => {
      if (!this._processing)
        this.getData()
    }, 1000)
  }
  _playerStuff(data) {
    const line = data.line
    const server = data.server
    if (line.type === "join") {
      Object.keys(this._servers).forEach((serverKey) => {
        if (this._servers[serverKey]?.discordid === server.discordid)
          this._servers[serverKey].playercount++
      })
    }
    if (line.type === "leave") {
      Object.keys(this._servers).forEach((serverKey) => {
        if (this._servers[serverKey]?.discordid === server.discordid)
          this._servers[serverKey].playercount--
      })
    }
  }
  async getData() {
    this._processing = true
    let promiseArray = this._servers.map(async (server) => {
      if (server.playercount !== 0) {
        try {
          let response = await rcon.rconCommand("/sc rcon.print(game.tick)", server.discordid).catch(() => { })
          server.ups = Math.abs(server.previousTick - parseInt(response))
          server.previousTick = parseInt(response)
        } catch {}
      }
      try {
        rcon.rconCommand(`/sc global.ext.var = game.json_to_table('${JSON.stringify({ server_ups: server.ups, ext: []})}')`, server.discordid).then(() => {}).catch(() => {})
      } catch {}
      return server
    })
    let serversUpdated = await Promise.all(promiseArray)
    this._servers = serversUpdated
    this._processing = false
  }
  exportData() { 
    return this._servers
  }
}

const UPSHandler = new _UPSHandler(serversJS)
module.exports = UPSHandler