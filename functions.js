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
        if (data.includes('[img=')) {
          data = data.replace(/\[img=.*\]/g, '[image]');
        }
        if (data.includes('[item=')) {
          data = data.replace(/\[item=.*\]/g, '[item]');
        }
        if (data.includes('[entity=')) {
          data = data.replace(/\[entity=.*\]/g, '[entity]');
        }
        if (data.includes('[technology=')) {
          data = data.replace(/\[technology=.*\]/g, '[research]');
        }
        if (data.includes('[recipe=')) {
          data = data.replace(/\[recipe=.*\]/g, '[recipe]');
        }
        if (data.includes('[item-group=')) {
          data = data.replace(/\[item-group=.*\]/g, '[item group]');
        }
        if (data.includes('[fluid=')) {
          data = data.replace(/\[fluid=.*\]/g, '[fluid]');
        }
        if (data.includes('[tile=')) {
          data = data.replace(/\[tile=.*\]/g, '[tile]');
        }
        if (data.includes('[virtual-signal=')) {
          data = data.replace(/\[virutal-signal=.*\]/g, '[signal]');
        }
        if (data.includes('[achievement=')) {
          data = data.replace(/\[achievement=.*\]/g, '[achievement]');
        }
        if (data.includes('[gps=')) {
          data = data.replace(/\[gps=.*\]/g, '[gps]');
        }
        if (data.includes('[special-item=')) {
          data = data.replace(/\[special-item=.*\]/g, '[bp/upgrade/decon]');
        }
        if (data.includes('[armor=')) {
          data = data.replace(/\[armor=.*\]/g, '[armor]');
        }
        if (data.includes('[train=')) {
          data = data.replace(/\[train=.*\]/g, '[train]')
        }
        if (data.includes('[train-stop=')) {
          data = data.replace(/\[train-stop.*\]/g, '[train stop]');
        }
      }
      return data;
    } else {
      return `**${data.slice((data.indexOf(']') + 2))}**`
    }
  },
  arrayRemoveOne: function (arr, value) {
    var index = arr.indexOf(value);
    if (index > -1) {
      arr.splice(index, 1);
    }
    return arr;
  },
  formatSaveData: function (data) {
    return data.slice((data.indexOf('_autosave') + 1), (data.indexOf('(') - 1));
  },
  sendToAll: function (message, sendWithUsername) {
    // The $message given to this function is an object of discord.js - it has the author username, message content, mentions etc.
    // The $sendWithUsername given to the function is a boolean value (fixed from being a 0 or 1). If sendWithUsername is true, it will send the message with the username
    // sends a message to all servers at once
    if (sendWithUsername) { // $sendWithUsername is true, therefore the message is sent with the username
      chronoFifo.write(`${message.author.username}: ${message.content}`, () => { });
      coreFifo.write(`${message.author.username}: ${message.content}`, () => { });
      coronaFifo.write(`${message.author.username}: ${message.content}`, () => { });
      eventFifo.write(`${message.author.username}: ${message.content}`, () => { });
      islandicFifo.write(`${message.author.username}: ${message.content}`, () => { });
      seablockFifo.write(`${message.author.username}: ${message.content}`, () => { });
      testFifo.write(`${message.author.username}: ${message.content}`, () => { });
      krastorioFifo.write(`${message.author.username}: ${message.content}`, () => { });
      spiderFifo.write(`${message.author.username}: ${message.content}`, () => { });
    } else { // sends just the message, no username, nothing because $sendWithUsername is false
      chronoFifo.write(`${message.content}`, () => { });
      coreFifo.write(`${message.content}`, () => { });
      coronaFifo.write(`${message.content}`, () => { });
      eventFifo.write(`${message.content}`, () => { });
      islandicFifo.write(`${message.content}`, () => { });
      seablockFifo.write(`${message.content}`, () => { });
      testFifo.write(`${message.content}`, () => { });
      krastorioFifo.write(`${message.content}`, () => { });
      spiderFifo.write(`${message.content}`, () => { });
    }
  },
  sendToServer: function (message, sendWithUsername) {
    // The $message given to this function is an object of discord.js - it has the author username, message content, mentions etc.
    // The $sendWithUsername given to the function is a boolean value (fixed from being a 0 or 1). If sendWithUsername is true, it will send the message with the username
    // sends a message to only one server with or without the username

    if (sendWithUsername == true) { //sends the message with the username and colon, as $sendWithUsername is true
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
    } else { //sends just the message, no username, nothing as $sendWithUsername is false
      if (message.channel.id === '718056299501191189') {
        coreFifo.write(`${message.content}`, () => { });
      }
      if (message.channel.id === '718056597154299934') {
        islandicFifo.write(`${message.content}`, () => { });
      }
      if (message.channel.id === '718056423153598545') {
        seablockFifo.write(`${message.content}`, () => { });
      }
      if (message.channel.id === '723280139982471247') {
        testFifo.write(`${message.content}`, () => { });
      }
      if (message.channel.id === '726502816469876747') {
        eventFifo.write(`${message.content}`, () => { });
      }
      if (message.channel.id === '724698782264066048') {
        chronoFifo.write(`${message.content}`, () => { });
      }
      if (message.channel.id === '724696348871622818') {
        coronaFifo.write(`${message.content}`, () => { });
      }
      if (message.channel.id === '745947531875319900') {
        krastorioFifo.write(`${message.content}`, () => { });
      }
      if (message.channel.id === '746438501339234446') {
        spiderFIFO.write(`${message.content}`, () => { });
      }
    }
  },
}
