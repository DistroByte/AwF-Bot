const { Client } = require('discord.js');
var Tail = require('tail').Tail;
const chatFormat = require('./chatFormat');
const { token, prefix } = require('./botconfig.json');
const { sendToServer, sendToAll } = require('./functions');
const { messageHelp, factoriospcommands, factoriompcommands } = require('./longMessages');

const chronoTail = new Tail('../servers/chronotrain/server.out');
const coreTail = new Tail('../servers/members-core/server.out');
const coronaTail = new Tail('../servers/corona-daycare/server.out');
const eventTail = new Tail('../servers/event-biter-battles/server.out');
const islandicTail = new Tail('../servers/members-islandic/server.out');
const seablockTail = new Tail('../servers/members-seablock/server.out');
const testTail = new Tail('../servers/test/server.out');
const krastorioTail = new Tail('../servers/members-krastorio2/server.out');
const spiderTail = new Tail('../servers/members-spidertron/server.out');

const client = new Client();

client.on('ready', () => {
  console.log(`${client.user.username} is online`);
});

//for sending messages from Discord to Factorio, or some random bot commands
client.on('message', (message) => {
  let slap = client.emojis.cache.find(emoji => emoji.name === "slap")
  if (message.content.includes('Jammy say hi')) return message.channel.send(':wave:');
  if (message.content.includes('Jammy work')) return message.channel.send('you coded me this way, your issue');
  if (message.author.bot) return
  if (message.content.includes('lenny')) return message.channel.send(`( ͡° ͜ʖ ͡°)`);
  if (message.content.includes('slap') && message.mentions) {
    message.delete();
    message.channel.send(`${message.mentions.members.first() || message.content.slice(message.content.indexOf('slap') + 5)} ${slap}`);
  }

  //handle bot commands
  if (message.content.startsWith(prefix)) {
    if (message.member.roles.cache.some(role => role.name === 'Admin') || message.member.roles.cache.some(role => role.name === 'Moderator') || message.member.roles.cache.some(role => role.name === 'dev'))
      if (message.content.startsWith(prefix + 'fcommandall')) {
        message.content = message.content.slice(13); //gets rid of the command prefix
        message.content = '/' + message.content;  //prefixes the message with a / to start commands in Factorio
        sendToAll(message, 0); //sends the command to all servers with no
        message.channel.send('Success!').then(message => message.delete({ timeout: 5000 }));
      }
    if (message.content.startsWith(prefix + 'fcommand')) {
      message.content = message.content.slice(10); //gets rid of the command prefix
      message.content = '/' + message.content;  //prefixes the message with a / to start commands in Factorio
      sendToServer(message, 0);
      message.channel.send('Success!').then(message => message.delete({ timeout: 5000 }));
    }
    if (message.content.startsWith(prefix + 'sendall')) { //sends a message to all servers with the username of the person sending
      message.content = message.content.slice(8); //gets rid of the command prefix
      sendToAll(message, 1);  //sends the message to all servers at once
      message.channel.send('Success!').then(message => message.delete({ timeout: 5000 }));
    }
  }
  if (message.content == prefix + 'h' || message.content == prefix + 'help') message.channel.send({ embed: messageHelp });
  if (message.content == prefix + 'factoriospcommands') message.channel.send({ embed: factoriospcommands });
  if (message.content == prefix + 'factoriompcommands') message.channel.send({ embed: factoriompcommands });

  //checking for mentions and replacing the user/channel id with the name
  if (message.content.includes('<@')) { //check if the message that the bot reads has a mention of a user
    message.mentions.users.forEach(user => {
      message.content = message.content.replace(/<@[\S.]*>/, '@' + user.username);
    });
  } else if (message.content.includes('<#')) { //check if the message includes a mention of a discord channel
    message.mentions.channels.forEach(channel => {
      message.content = message.content.replace(/<#[\S.]*>/, '#' + channel.name);
    });
  }

  //phase of sending the message from discord to Factorio
  if (message.author.bot) return
  sendToServer(message, 1); // send the message to corresponding server
});
var result = ''
coreTail.on('line', function (line) {
  result = chatFormat(line, '718056299501191189', client);
  if (result != null) {
    
  }
  console.log(`[CORE] ${line}`);
});

islandicTail.on("line", function (line) {
  chatFormat(line, '718056597154299934', client);
  console.log(`[ISLANDIC] ${line}`);
});

seablockTail.on('line', function (line) {
  chatFormat(line, '718056423153598545', client);
  console.log(`[SEABLOCK] ${line}`);
});

testTail.on('line', function (line) {
  chatFormat(line, '723280139982471247', client);
  console.log(`[TEST] ${line}`);
});

eventTail.on('line', function (line) {
  chatFormat(line, '726502816469876747', client);
  console.log(`[EVENT] ${line}`);
});

chronoTail.on('line', function (line) {
  chatFormat(line, '724698782264066048', client);
  console.log(`[CHRONOTRAIN] ${line}`);
});

coronaTail.on('line', function (line) {
  chatFormat(line, '724696348871622818', client);
  console.log(`[CORONA] ${line}`);
});

krastorioTail.on('line', function (line) {
  chatFormat(line, '745947531875319900', client);
  console.log(`[KRASTORIO] ${line}`);
});

spiderTail.on('line', function (line) {
  chatFormat(line, '746438501339234446', client);
  console.log(`[SPIDER] ${line}`);
});

client.login(token);
