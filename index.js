const { Client, Collection } = require('discord.js');
var Tail = require('tail').Tail;
const chatFormat = require('./chatFormat');
const { token, prefix } = require('./botconfig.json');

const testTail = new Tail('../servers/test/server.out');

const client = new Client();

client.prefix = prefix;

["commands", "aliases"].forEach(x => client[x] = new Collection());
["command", "event"].forEach(x => require(`./handlers/${x}`)(client));

client.login(token);

testTail.on('line', function (line) {
  chatFormat(line, '723280139982471247', client);
  console.log(`[TEST] ${line}`);
});