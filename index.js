const { Client, Collection } = require('discord.js');
var Tail = require('tail').Tail;
const chatFormat = require('./chatFormat');
const { token, prefix } = require('./botconfig.json');
const servers = require('./servers.json'); // tails, fifo, discord IDs etc.

/*
TODO: add a points system that gives points according to this https://discord.com/channels/548410604679856151/718084746693050459/774959707270021120

*/


let serverTails = []
Object.keys(servers).forEach(element => {
  serverTails.push([new Tail(servers[element].serverOut), servers[element]]);
})

const client = new Client();

client.prefix = prefix;

["commands", "aliases"].forEach(x => client[x] = new Collection());
["command", "event"].forEach(x => require(`./handlers/${x}`)(client));

client.login(token);

serverTails.forEach(element => {
  element[0].on('line', function (line) {
    chatFormat(line, element[1].discordChannelID, client);
    console.log(`[${element[1].name}] ${line}`);
  });
})