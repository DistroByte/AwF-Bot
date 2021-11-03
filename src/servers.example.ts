import { FactorioServer } from "./types";

const servers: FactorioServer[] = [
  {
    name: "DEV-DUMP", // server name in logs
    discordname: "dev-dump", // discord channel name for the server
    discordid: "723280139982471247", // id of the discord channel where server messages will be sent
    path: "test", // where the server is located relative to "serverpath" in ./config.js
    rconoffset: 0, // rcon port offset from "rconport" in ./config.js

    // whether https://mods.factorio.com/mod/awf-graftorioMod
    // or an alternative with the same formatis installed
    enabledGraftorio: true,
    toWatch: {
      // things to watch in the server's directory
      serverOut: true, // vanilla, chat log
      awfLogging: true, // requires just the mod
      datastore: false, // requires the full scenario, not just the mod
      discord: false, // requires the full scenario, not just the mod
    },
    dev: false, // whether or not the server is developmental
	hidden: false, // whether the server is hidden from ?po etc
  },
];

export default servers;
