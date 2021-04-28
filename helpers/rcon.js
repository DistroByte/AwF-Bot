const {Rcon} = require("rcon-client")
const { rconport, rconpw, errorchannel } = require("../config")
const servers = require("../servers")

class rconInterface {
  constructor(rconConfig, pw) {
    this._rconConfig = rconConfig
    this._rconConnections = []
    this._init()
    this._client = undefined
  }
  _init() {
    if (!this._rconConfig) return console.log("no config")
    this._rconConfig.forEach(async (server) => {
      let rcon = new Rcon({
        host: "localhost",
        port: server.rconport,
        password: rconpw
      })
      try {
        await rcon.connect()
        this._rconConnections.push({
          rcon: rcon,
          server: server.server
        })
        
        // reconnection mechanism
        rcon.on("end", () => {
          let i = 0
          const interval = setInterval(async () => {
            try {
              rcon.connect().then(() => {
                clearInterval(interval)
              }).catch(() => {})
              i++
              if (i === 60) { // 5 minutes
                // clearInterval(interval) // just keep trying to reconnect
                this.client?.channels.fetch(errorchannel).then((channel) => channel.send(`Server <#${server.server.discordid}> is having RCON issues`))
              }
            } catch (error) {}
          }, 5000)
        })
      } catch (error) {
        console.error(error)
        const interval = setInterval(() => {
          this.client?.channels?.fetch(errorchannel).then((channel) => channel?.send(`Server <#${server.server.discordid}> is having RCON issues`))
            .then(() => clearInterval(interval)).catch(() => {})
        }, 1000)
      }
    })
  }
  async rconCommand(command, serverIdentifier) {
    if (!command.startsWith("/")) command = `/${command}`;
    let server = undefined;
    this._rconConnections.forEach(serverConnections => {
      if ([serverConnections.server.name, serverConnections.server.discordid, serverConnections.server.discordname].some((identifier) => identifier === serverIdentifier))
        server = serverConnections;
    });
    if (server == undefined) {
      console.error(`Server with identifier ${serverIdentifier} couldn't be found`);
      throw new Error("Server couldn't be found");
    }
    try {
      let resp = await server.rcon.send(command);
      if (typeof resp == "string" && resp.length) return resp;
    } catch (error) {
      console.error(error);
      return error;
    }
  }
  async rconCommandAll(command) {
    let promiseArray = this._rconConnections.map(async (server) => {
      return new Promise(async (resolve, reject) => {
        const resultIdentifier = {
          name: server.server.name,
          discordid: server.server.discordid,
          discordname: server.server.discordname,
        }
        this.rconCommand(command, server.server.discordid)
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
    let nameArr = this._rconConnections.map((connection) => { return connection.server.name });
    let channelIDArr = this._rconConnections.map((connection) => { return connection.server.discordChannelID });
    let channelNameArr = this._rconConnections.map((connection) => { return connection.server.discordChannelName });
    overlap.push(...getArrayOverlap(exclusionServerIdentifiers, nameArr));
    overlap.push(...getArrayOverlap(exclusionServerIdentifiers, channelIDArr));
    overlap.push(...getArrayOverlap(exclusionServerIdentifiers, channelNameArr));

    let toRun = [];
    this._rconConnections.forEach(connection => {
      if (overlap.includes(connection.server.name) ||
        overlap.includes(connection.server.discordChannelID) ||
        overlap.includes(connection.server.discordChannelName)) return
      else
        toRun.push(connection);
    });

    let promiseArray = toRun.map((connection) => {
      return new Promise((resolve, reject) => {
        const resultIdentifier = {
          name: connection.server.name,
          discordChannelID: connection.server.discordChannelID,
          discordChannelName: connection.server.discordChannelName,
        }
        this.rconCommand(command, connection.server.discordChannelID)
          .then(res => resolve([res, resultIdentifier]))
          .catch(e => reject([e, resultIdentifier]))
      });
    });
    return await Promise.all(promiseArray);
  }
}
const rconPorts = servers.map((server) => {
  return {
    rconport: server.rconoffset + rconport,
    server: server
  }
})
const rcon = new rconInterface(rconPorts, rconpw)
module.exports = rcon