import { BotConfig } from "./types";

const config: BotConfig = {
  token: "", // Discord bot token
  prefix: ".", // Bot prefix
  inviteURL: "", // Bot's invite url or nothing
  supportURL: "", // Bot's support url or nothing
  mongoDB: "", // DB connection string
  dbOptions: {
    // DB options
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  },
  embed: {
    // Embed stuff
    color: "#1207b5",
    footer: "AwF",
  },
  owner: {
    // Discord owner identificators
    id: "429696038266208258",
    name: "oof2win2#3149",
  },
  emojis: {
    // Some emojis. Will display 'undefined' if not found
    playerjoin: "<:warning:828632973266911264>",
    playerleave: "<:unplugged:776827668435042375>",
    sciencepack: "<:science_pack:827525451202822184>",
    playerdeath: "<:Destroyedicon:827524502446407680>",
    logibots: "<:logistis_robot:776830608026238996>",
    bigspitter: "<:bigspitter:827523465841475614>",
    behemothspitter: "<:behemothspitter:827522992882974721>",
    serversave: ":floppy_disk:",
  },
  serverpath: "/opt/factorio/servers", // path to all servers
  rconport: 0, // Base RCON port
  rconpw: "", // RCON password string
  watchable: {
    // Watchable file list. Might break if modified
    serverOut: "server.out",
    awfLogging: "script-output/ext/awflogging.out",
    datastore: "script-output/ext/datastore.out",
    discord: "script-output/ext/discord.out",
  },
  errorchannel: "", // Channel to send errors and other messages to
  moderatorchannel: "", // Moderator channel ID. Sends messages when a player uses /c etc.
  testbotid: "", // ID of the test bot. Can be blank.
  factorioRoles: {
    admin: { id: "", name: "" }, // unlimited amount of these available
    moderator: { id: "", name: "" }, // Factorio-Discord role sync. Discord role ID:Factorio role name. Example below
    veteran: { id: "548545406653431810", name: "Senior Administrator" },
    trusted: { id: "", name: "" },
  },
  archivePath: "", // path to your archive folder
  promPort: 9111, // port for prometheus to run on

  moderatorroleid: "", // discord moderator role id
  adminroleid: "548545406653431810", // discord admin role id
  customPermissions: [
    { name: "RCON_CMD", roleid: "555824650324672522" },
    { name: "MANAGE_SERVER", roleid: "555824650324672522" },
  ],
  grafanaInterval: 15 * 1000, // scrape data every 15s
  safeGuilds: ["548410604679856151"],
};

export default config;
