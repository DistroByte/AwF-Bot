const { Client, Collection } = require('discord.js');
var Tail = require('tail').Tail;
const chatFormat = require('./chatFormat');
const { token, prefix } = require('./botconfig.json');

const coreTail = new Tail('../servers/members-core/server.out');
const coronaTail = new Tail('../servers/corona-daycare/server.out');
const seablockTail = new Tail('../servers/members-seablock/server.out');
const testTail = new Tail('../servers/test/server.out');
const krastorioTail = new Tail('../servers/members-krastorio2/server.out');
const bobangelsTail = new Tail('../servers/members-bobs-angels/server.out')

const client = new Client();


client.prefix = prefix;

["commands", "aliases"].forEach(x => client[x] = new Collection());
["command", "event"].forEach(x => require(`./handlers/${x}`)(client));

client.login(token);


// if (message.content == prefix + 'h' || message.content == prefix + 'help') message.channel.send({ embed: messageHelp });
// if (message.content == prefix + 'factoriospcommands') message.channel.send({ embed: factoriospcommands });
// if (message.content == prefix + 'factoriompcommands') message.channel.send({ embed: factoriompcommands });

coreTail.on('line', function (line) {
  result = chatFormat(line, '718056299501191189', client);
  if (result != null) {

  }
  console.log(`[CORE] ${line}`);
});

seablockTail.on('line', function (line) {
  chatFormat(line, '718056423153598545', client);
  console.log(`[SEABLOCK] ${line}`);
});

testTail.on('line', function (line) {
  chatFormat(line, '723280139982471247', client);
  console.log(`[TEST] ${line}`);
});

coronaTail.on('line', function (line) {
  chatFormat(line, '724696348871622818', client);
  console.log(`[CORONA] ${line}`);
});

krastorioTail.on('line', function (line) {
  chatFormat(line, '745947531875319900', client);
  console.log(`[KRASTORIO] ${line}`);
});

bobangelsTail.on('line', function (line) {
  chatFormat(line, '750760237610303559', client);
  console.log(`[BOBANGELS] ${line}`);
});
