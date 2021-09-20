module.exports = [
  {
    name: "DEV-DUMP",   // server name in logs
    discordname: "dev-dump",  // discord channel name for the server
    discordid: "723280139982471247", // id of the discord channel where server messages will be sent
    path: "test", // where the server is located relative to "serverpath" in ./config.js
    rconoffset: 0, // rcon port offset from "rconport" in ./config.js
    toWatch: { // things to watch in the server's directory
      serverOut: true,  // vanilla, chat log
      awfLogging: true, // requires just the mod
      datastore: false, // requires the full scenario, not just the mod
      discord: false    // requires the full scenario, not just the mod
    },
    dev: false, // whether or not the server is developmental
  },
}
