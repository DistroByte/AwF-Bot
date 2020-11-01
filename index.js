const { Client, Collection } = require('discord.js');
var Tail = require('tail').Tail;
const chatFormat = require('./chatFormat');
const { token, prefix } = require('./botconfig.json');

const coreTail = new Tail('../servers/members-core/server.out');
const coronaTail = new Tail('../servers/corona-daycare/server.out');
const testTail = new Tail('../servers/test/server.out');
const redbrickTail = new Tail('../servers/redbrick/server.out');
const sevanillaTail = new Tail('../servers/members-se-vanilla/server.out')

const client = new Client();

client.prefix = prefix;

["commands", "aliases"].forEach(x => client[x] = new Collection());
["command", "event"].forEach(x => require(`./handlers/${x}`)(client));

client.login(token);

coreTail.on('line', function (line) {
  result = chatFormat(line, '718056299501191189', client);
  console.log(`[CORE] ${line}`);
});

testTail.on('line', function (line) {
  chatFormat(line, '723280139982471247', client);
  console.log(`[TEST] ${line}`);
});

coronaTail.on('line', function (line) {
  chatFormat(line, '724696348871622818', client);
  console.log(`[CORONA] ${line}`);
});

redbrickTail.on('line', function (line) {
  chatFormat(line, '764651709632348162', client);
  console.log(`[REDBRICK] ${line}`)
});

sevanillaTail.on('line', function (line) {
  chatFormat(line, '772057588317552640', client);
  console.log(`[SE-VANILLA] ${line}`)
});
