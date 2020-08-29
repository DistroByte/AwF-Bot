const FIFO = require('fifo-js');

const chronoFifo = new FIFO('../servers/chronotrain/server.fifo');
const coreFifo = new FIFO('../servers/members-core/server.fifo');
const coronaFifo = new FIFO('../servers/corona-daycare/server.fifo');
const eventFifo = new FIFO('../servers/event-biter-battles/server.fifo');
const islandicFifo = new FIFO('../servers/members-islandic/server.fifo');
const seablockFifo = new FIFO('../servers/members-seablock/server.fifo');
const testFifo = new FIFO('../servers/test/server.fifo');
const krastorioFifo = new FIFO('../servers/members-krastorio2/server.fifo');
const spiderFifo = new FIFO('../servers/members-spidertron/server.fifo');

module.exports = {
  formatVersion: function (data) {
    data.trim();
    return data.slice(data.indexOf('Factorio'), data.indexOf('(b')).trim();
  },
  formatDate: function (data) {
    data.trim();
    return data.slice((data.indexOf('0.000') + 6), 25);
  },
  formatChatData: function (data) {
    if (data.includes('[CHAT]') || data.includes('(shout)')) {
      data = data.slice((data.indexOf(']') + 2)); //removing the [CHAT] from sending to Discord
      if (data.includes('[')) {
        //These all are for Factorio rich text magic, in order of https://wiki.factorio.com/Rich_text
        //for now, the discord will show [image], [item], [gps] but that can be removed completely by just
        //replacing the second phrase in the .replace with an empty string, i.e. ''
        if (data.includes('[img=')) data.replace(/\[img=.*\]/g, '[image]');
        if (data.includes('[item=')) data.replace(/\[item=.*\]/g, '[item]');
        if (data.includes('[entity=')) data.replace(/\[entity=.*\]/g, '[entity]');
        if (data.includes('[technology=')) data.replace(/\[technology=.*\]/g, '[research]');
        if (data.includes('[recipe=')) data.replace(/\[recipe=.*\]/g, '[recipe]');
        if (data.includes('[item-group=')) data.replace(/\[item-group=.*\]/g, '[item group]');
        if (data.includes('[fluid=')) data.replace(/\[fluid=.*\]/g, '[fluid]');
        if (data.includes('[tile=')) data.replace(/\[tile=.*\]/g, '[tile]');
        if (data.includes('[virtual-signal=')) data.replace(/\[virutal-signal=.*\]/g, '[signal]');
        if (data.includes('[achievement=')) data.replace(/\[achievement=.*\]/g, '[achievement]');
        if (data.includes('[gps=')) data.replace(/\[gps=.*\]/g, '[gps]');
        if (data.includes('[special-item=')) data.replace(/\[special-item=.*\]/g, '[bp/upgrade/decon]');
        if (data.includes('[armor=')) data.replace(/\[armor=.*\]/g, '[armor]');
        if (data.includes('[train=')) data.replace(/\[train=.*\]/g, '[train]')
        if (data.includes('[train-stop=')) data.replace(/\[train-stop.*\]/g, '[train stop]');
      }
      return data
    } else {
      return `**${data.slice((data.indexOf(']') + 2))}**`
    }
  },
  formatSaveData: function (data) {
    return data.slice((data.indexOf('_autosave') + 1), (data.indexOf('(') - 1));
  },
  sendToAll: function (message, sendWithUsername) {
    // gets the message as an object and if provided, will send the message with the username - if not provided, will send without (useful for commands)
    // sends a message to all servers at once
    let msg = message.content
    let auth = message.author.username

    if (sendWithUsername == 1) {
      chronoFifo.write(`${auth}: ${msg}`, () => { });
      coreFifo.write(`${auth}: ${msg}`, () => { });
      coronaFifo.write(`${auth}: ${msg}`, () => { });
      eventFifo.write(`${auth}: ${msg}`, () => { });
      islandicFifo.write(`${auth}: ${msg}`, () => { });
      seablockFifo.write(`${auth}: ${msg}`, () => { });
      testFifo.write(`${auth}: ${msg}`, () => { });
      krastorioFifo.write(`${auth}: ${msg}`, () => { });
      spiderFifo.write(`${auth}: ${msg}`, () => { });
    } else { //sends just the message, no username, nothing
      chronoFifo.write(`${msg}`, () => { });
      coreFifo.write(`${msg}`, () => { });
      coronaFifo.write(`${msg}`, () => { });
      eventFifo.write(`${msg}`, () => { });
      islandicFifo.write(`${msg}`, () => { });
      seablockFifo.write(`${msg}`, () => { });
      testFifo.write(`${msg}`, () => { });
      krastorioFifo.write(`${msg}`, () => { });
      spiderFifo.write(`${msg}`, () => { });
    }
  },
  sendToServer: function (message, sendWithUsername) {
    // gets the message as an object and if provided, will send the message with the username - if not provided, will send without (useful for commands)
    let msg = message.content
    let auth = message.author.username

    if (message.channel.id === '718056299501191189') {
      sendWithUsername === 1 ? coreFifo.write(`${auth}: ${msg}`, () => { }) : coreFifo.write(`${msg}`, () => { });
    }
    if (message.channel.id === '718056597154299934') {
      sendWithUsername === 1 ? islandicFifo.write(`${auth}: ${msg}`, () => { }) : islandicFifo.write(`${msg}`, () => { });
    }
    if (message.channel.id === '718056423153598545') {
      sendWithUsername === 1 ? seablockFifo.write(`${auth}: ${msg}`, () => { }) : seablockFifo.write(`${msg}`, () => { });
    }
    if (message.channel.id === '723280139982471247') {
      sendWithUsername === 1 ? testFifo.write(`${auth}: ${msg}`, () => { }) : testFifo.write(`${msg}`, () => { });
    }
    if (message.channel.id === '726502816469876747') {
      sendWithUsername === 1 ? eventFifo.write(`${auth}: ${msg}`, () => { }) : eventFifo.write(`${msg}`, () => { });
    }
    if (message.channel.id === '724698782264066048') {
      sendWithUsername === 1 ? chronoFifo.write(`${auth}: ${msg}`, () => { }) : chronoFifo.write(`${msg}`, () => { });
    }
    if (message.channel.id === '724696348871622818') {
      sendWithUsername === 1 ? coronaFifo.write(`${auth}: ${msg}`, () => { }) : coronaFifo.write(`${msg}`, () => { });
    }
    if (message.channel.id === '745947531875319900') {
      sendWithUsername === 1 ? krastorioFifo.write(`${auth}: ${msg}`, () => { }) : krastorioFifo.write(`${msg}`, () => { });
    }
    if (message.channel.id === '746438501339234446') {
      sendWithUsername === 1 ? spiderFifo.write(`${auth}: ${msg}`, () => { }) : spiderFifo.write(`${msg}`, () => { });
    }
  },
}
