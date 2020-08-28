const { Client } = require('discord.js');
const FIFO = require('fifo-js');
var Tail = require('tail').Tail;
const chatFormat = require('./chatFormat');
const { token } = require('./botconfig.json');

const serverFolder = '../servers/';
const fs = require('fs');
const path = require('path');
const files = fs.readdirSync(serverFolder);
let servers = [];
for (file of files) {
  const stat = fs.lstatSync(path.join(serverFolder, file))
  stat.isDirectory() ? servers.push(file) : console.log();
}

console.log(servers);

const chronoTail = new Tail('../servers/chronotrain/server.out');
const coreTail = new Tail('../servers/members-core/server.out');
const coronaTail = new Tail('../servers/corona-daycare/server.out');
const eventTail = new Tail('../servers/event-biter-battles/server.out');
const islandicTail = new Tail('../servers/members-islandic/server.out');
const seablockTail = new Tail('../servers/members-seablock/server.out');
const testTail = new Tail('../servers/test/server.out');
const krastorioTail = new Tail('../servers/members-krastorio2/server.out');
const spiderTail = new Tail('../servers/members-spidertron/server.out');

const chronoFifo = new FIFO('../servers/chronotrain/server.fifo');
exports.chronoFifo = chronoFifo;
const coreFifo = new FIFO('../servers/members-core/server.fifo');
exports.coreFifo = coreFifo;
const coronaFifo = new FIFO('../servers/corona-daycare/server.fifo');
exports.coronaFifo = coronaFifo;
const eventFifo = new FIFO('../servers/event-biter-battles/server.fifo');
exports.eventFifo = eventFifo;
const islandicFifo = new FIFO('../servers/members-islandic/server.fifo');
exports.islandicFifo = islandicFifo;
const seablockFifo = new FIFO('../servers/members-seablock/server.fifo');
exports.seablockFifo = seablockFifo;
const testFifo = new FIFO('../servers/test/server.fifo');
exports.testFifo = testFifo;
const krastorioFifo = new FIFO('../servers/members-krastorio2/server.fifo');
exports.krastorioFifo = krastorioFifo;
const spiderFIFO = new FIFO('../servers/members-spidertron/server.fifo');
exports.spiderFIFO = spiderFIFO;

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
  console.log(`${client.user.username} is online`)
  setInterval(sendMessage, 1000);
});

client.on('message', (message) => {
  if (message.content.includes('Jammy say hi')) message.channel.send(':wave:');
  if (message.author.bot) return
  if (message.content.includes('lenny')) message.channel.send(`( ͡° ͜ʖ ͡°)`);
  if (message.channel.id === '718056299501191189') {
    coreFifo.write(`${message.author.username}: ${message.content}`, () => { });
  }
  if (message.channel.id === '718056597154299934') {
    islandicFifo.write(`${message.author.username}: ${message.content}`, () => { });
  }
  if (message.channel.id === '718056423153598545') {
    seablockFifo.write(`${message.author.username}: ${message.content}`, () => { });
  }
  if (message.channel.id === '723280139982471247') {
    testFifo.write(`${message.author.username}: ${message.content}`, () => { });
  }
  if (message.channel.id === '726502816469876747') {
    eventFifo.write(`${message.author.username}: ${message.content}`, () => { });
  }
  if (message.channel.id === '724698782264066048') {
    chronoFifo.write(`${message.author.username}: ${message.content}`, () => { });
  }
  if (message.channel.id === '724696348871622818') {
    coronaFifo.write(`${message.author.username}: ${message.content}`, () => { });
  }
  if (message.channel.id === '745947531875319900') {
    krastorioFifo.write(`${message.author.username}: ${message.content}`, () => { });
  }
  if (message.channel.id === '746438501339234446') {
    spiderFIFO.write(`${message.author.username}: ${message.content}`, () => { });
  }
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
