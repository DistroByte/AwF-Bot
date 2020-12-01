const { Client, Collection } = require("discord.js");
var Tail = require("tail").Tail;
const chatFormat = require("./chatFormat");
const { token, prefix } = require("./botconfig.json");
const servers = require("./servers.json"); // tails, fifo, discord IDs etc.
<<<<<<< HEAD
const { discordLog, awfLogging } = require("./functions");
=======
const { discordLog } = require("./functions");
>>>>>>> e93f64f7fb9a56c315e2a2e5d39d9eddcf875b45

let serverTails = [];
let discordLoggingTails = [];
let awfLoggingTails = [];
Object.keys(servers).forEach((element) => {
  awfLoggingTails.push([
    new Tail(
      `../servers/${servers[element].serverFolderName}/script-output/ext/awflogging.out`
    ),
    servers[element],
  ]);
  discordLoggingTails.push([
    new Tail(
      `../servers/${servers[element].serverFolderName}/script-output/ext/discord.out`
    ),
    servers[element],
  ]);
  serverTails.push([new Tail(servers[element].serverOut), servers[element]]);
});
let discordLoggingTails = [];
Object.keys(servers).forEach((element) => {
  discordLoggingTails.push([
    new Tail(
      `../servers/${servers[element].serverFolderName}/script-output/ext/discord.out`
    ),
    servers[element],
  ]);
});

const client = new Client();

client.prefix = prefix;

["commands", "aliases"].forEach((x) => (client[x] = new Collection()));
["command", "event"].forEach((x) => require(`./handlers/${x}`)(client));

client.login(token);

serverTails.forEach((element) => {
  element[0].on("line", function (line) {
    chatFormat(line, element[1].discordChannelID, client, element[1].name);
    console.log(`[${element[1].name}] ${line}`);
  });
});
discordLoggingTails.forEach((element) => {
  element[0].on("line", function (line) {
    discordLog(
      JSON.parse(line),
      element[1].discordChannelID,
      client,
      element[1].discordChannelName
    );
  });
});
awfLoggingTails.forEach((element) => {
  element[0].on("line", function (line) {
    awfLogging(
      JSON.parse(line),
      element[1].discordChannelID,
      client,
      element[1].discordChannelName
    );
  });
});
