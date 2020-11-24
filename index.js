const { Client, Collection } = require("discord.js");
var Tail = require("tail").Tail;
const chatFormat = require("./chatFormat");
const { token, prefix } = require("./botconfig.json");
const servers = require("./servers.json"); // tails, fifo, discord IDs etc.

let serverTails = [];
Object.keys(servers).forEach((element) => {
  serverTails.push([new Tail(servers[element].serverOut), servers[element]]);
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
