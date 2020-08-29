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

const chronoLineData = [];
const coreLineData = [];
const coronaLineData = [];
const eventLineData = [];
const islandicLineData = [];
const seablockLineData = [];
const testLineData = [];
const krastorioLineData = [];
const spiderLineData = [];

client.on('ready', () => {
  console.log(`${client.user.username} is online`);
  setInterval(sendMessage, 1000);
});

//for sending messages from Discord to Factorio, or some random bot commands
client.on('message', (message) => {
  if (message.content.includes('Jammy say hi')) return message.channel.send(':wave:');
  if (message.content.includes('Jammy work')) return message.channel.send('you coded me this way, your issue');
  if (message.author.bot) return
  if (message.content.includes('lenny')) return message.channel.send(`( ͡° ͜ʖ ͡°)`);
  if (message.content.includes('slap') && message.mentions)
    return message.channel.send(`${message.mentions.members.first()} :clap:`);

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
  if (message.content.includes('lenny')) message.channel.send(`( ͡° ͜ʖ ͡°)`);
  sendToServer(message, 1); // send the message to corresponding server
});

function sendMessage() {
  coreLineData.forEach(line => {
    chatFormat(line, coreLineData, '718056299501191189', client);
  });

  islandicLineData.forEach(line => {
    chatFormat(line, islandicLineData, '718056597154299934', client);
  });

  seablockLineData.forEach(line => {
    chatFormat(line, seablockLineData, '718056423153598545', client);
  });

  testLineData.forEach(line => {
    chatFormat(line, testLineData, '723280139982471247', client);
  });

  eventLineData.forEach(line => {
    chatFormat(line, eventLineData, '726502816469876747', client);
  });

  chronoLineData.forEach(line => {
    chatFormat(line, chronoLineData, '724698782264066048', client);
  });

  coronaLineData.forEach(line => {
    chatFormat(line, coronaLineData, '724696348871622818', client);
  });

  krastorioLineData.forEach(line => {
    chatFormat(line, krastorioLineData, '745947531875319900', client);
  });

  spiderLineData.forEach(line => {
    chatFormat(line, spiderLineData, '746438501339234446', client);
  });
}

coreTail.on('line', function (data) {
  coreLineData.push(data);
  console.log(`[CORE] ${data}`);
});

islandicTail.on("line", function (data) {
  islandicLineData.push(data);
  console.log(`[ISLANDIC] ${data}`);
});

seablockTail.on('line', function (data) {
  seablockLineData.push(data);
  console.log(`[SEABLOCK] ${data}`);
});

testTail.on('line', function (data) {
  testLineData.push(data);
  console.log(`[TEST] ${data}`);
});

eventTail.on('line', function (data) {
  eventLineData.push(data);
  console.log(`[EVENT] ${data}`);
});

chronoTail.on('line', function (data) {
  chronoLineData.push(data);
  console.log(`[CHRONOTRAIN] ${data}`)
});

coronaTail.on('line', function (data) {
  coronaLineData.push(data);
  console.log(`[CORONA] ${data}`)
});

krastorioTail.on('line', function (data) {
  krastorioLineData.push(data);
  console.log(`[KRASTORIO] ${data}`)
});

spiderTail.on('line', function (data) {
  spiderLineData.push(data);
  console.log(`[SPIDER] ${data}`)
});

client.login(token);