const FIFO = require('fifo-js');
const fs = require('fs');

const coreFifo = new FIFO('../servers/members-core/server.fifo');
const coronaFifo = new FIFO('../servers/corona-daycare/server.fifo');
const seablockFifo = new FIFO('../servers/members-seablock/server.fifo');
const testFifo = new FIFO('../servers/test/server.fifo');
const krastorioFifo = new FIFO('../servers/members-krastorio2/server.fifo');
const bobangelsFifo = new FIFO('../servers/members-bobs-angels/server.fifo');


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
        if (data.includes('[img=')) return data.replace(/\[img=.*\]/g, '[image]');
        if (data.includes('[item=')) return data.replace(/\[item=.*\]/g, '[item]');
        if (data.includes('[entity=')) return data.replace(/\[entity=.*\]/g, '[entity]');
        if (data.includes('[technology=')) return data.replace(/\[technology=.*\]/g, '[research]');
        if (data.includes('[recipe=')) return data.replace(/\[recipe=.*\]/g, '[recipe]');
        if (data.includes('[item-group=')) return data.replace(/\[item-group=.*\]/g, '[item group]');
        if (data.includes('[fluid=')) return data.replace(/\[fluid=.*\]/g, '[fluid]');
        if (data.includes('[tile=')) return data.replace(/\[tile=.*\]/g, '[tile]');
        if (data.includes('[virtual-signal=')) return data.replace(/\[virutal-signal=.*\]/g, '[signal]');
        if (data.includes('[achievement=')) return data.replace(/\[achievement=.*\]/g, '[achievement]');
        if (data.includes('[gps=')) return data.replace(/\[gps=.*\]/g, '[gps]');
        if (data.includes('[special-item=')) return data.replace(/\[special-item=.*\]/g, '[bp/upgrade/decon]');
        if (data.includes('[armor=')) return data.replace(/\[armor=.*\]/g, '[armor]');
        if (data.includes('[train=')) return data.replace(/\[train=.*\]/g, '[train]')
        if (data.includes('[train-stop=')) return data.replace(/\[train-stop.*\]/g, '[train stop]');
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
    // The $message given to this function is an object of discord.js - it has the author username, message content, mentions etc.
    // The $sendWithUsername given to the function is a boolean value (fixed from being a 0 or 1). If sendWithUsername is true, it will send the message with the username
    // sends a message to all servers at once
    if (sendWithUsername) { // $sendWithUsername is true, therefore the message is sent with the username
      coreFifo.write(`${message.author.username}: ${message.content}`, () => { });
      coronaFifo.write(`${message.author.username}: ${message.content}`, () => { });
      seablockFifo.write(`${message.author.username}: ${message.content}`, () => { });
      testFifo.write(`${message.author.username}: ${message.content}`, () => { });
      krastorioFifo.write(`${message.author.username}: ${message.content}`, () => { });
      bobangelsFifo.write(`${message.author.username}: ${message.content}`, () => { });
    } else { // sends just the message, no username, nothing because $sendWithUsername is false
      coreFifo.write(`${message.content}`, () => { });
      coronaFifo.write(`${message.content}`, () => { });
      seablockFifo.write(`${message.content}`, () => { });
      testFifo.write(`${message.content}`, () => { });
      krastorioFifo.write(`${message.content}`, () => { });
      bobangelsFifo.write(`${message.content}`, () => { });
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
      if (message.channel.id === '718056423153598545') {
        seablockFifo.write(`${message.author.username}: ${message.content}`, () => { });
      }
      if (message.channel.id === '723280139982471247') {
        testFifo.write(`${message.author.username}: ${message.content}`, () => { });
      }
      if (message.channel.id === '724696348871622818') {
        coronaFifo.write(`${message.author.username}: ${message.content}`, () => { });
      }
      if (message.channel.id === '745947531875319900') {
        krastorioFifo.write(`${message.author.username}: ${message.content}`, () => { });
      }
      if (message.channel.id === '750760237610303559') {
        bobangelsFifo.write(`${message.author.username}: ${message.content}`, () => { });
      }
    } else { //sends just the message, no username, nothing as $sendWithUsername is false
      if (message.channel.id === '718056299501191189') {
        coreFifo.write(`${message.content}`, () => { });
      }
      if (message.channel.id === '718056423153598545') {
        seablockFifo.write(`${message.content}`, () => { });
      }
      if (message.channel.id === '723280139982471247') {
        testFifo.write(`${message.content}`, () => { });
      }
      if (message.channel.id === '724696348871622818') {
        coronaFifo.write(`${message.content}`, () => { });
      }
      if (message.channel.id === '745947531875319900') {
        krastorioFifo.write(`${message.content}`, () => { });
      }
      if (message.channel.id === '750760237610303559') {
        bobangelsFifo.write(`${message.content}`, () => { });
      }
    }
  },
  readJSON: function (file) {
    fs.readFile(file, function (err, data) {
      if (err) throw err;
      var data = JSON.parse(data);  //the data is now an Object
    });
    return data;
  },
  writeJSON: function (data) {
    fs.writeFile("serverData.json", JSON.stringify(data), err => {
      if (err) throw err;
    });
  },
  setupObject: function (data, server) {
    if (data.servers === undefined)
      data.servers = {};
    if (data.servers[server] === undefined)
      data.servers[server] = {};
    if (data.servers[server].players === undefined)
      data.servers[server].players = {};
    if (data.servers[server].rocketLaunches === undefined)
      data.servers[server].rocketLaunches = 0;
    if (data.servers[server].research === undefined)
      data.servers[server].research = {};
    return data
  },
  addDeath: function (data, server, player, reason) {
    if (data.servers[server].players[player] === undefined)
      data.servers[server].players[player] = {};
    if (data.servers[server].players[player][reason] === undefined)
      data.servers[server].players[player][reason] = 0;
    data.servers[server].players[player][reason]++; //adds to the reason
    return data;
  },
  rocketLaunched: function (data, server) {
    data.servers[server].rocketLaunches++;
    return data;
  },
  addResearch: function (data, server, researched, level) {
    if (data.servers[server].research[researched] === undefined)
      data.servers[server].research[researched] = 0;
    data.servers[server].research[researched]++;
    return data;
  },
  parseJammyLogger: function (line, channel) { //channel is an object
    //this long asf function parses JammyLogger lines in the console and does magic stuff
    //for now as this doesnt work yet
    if (line.includes('JFEEDBACK: ')) { //if line is feedback for a JammyBot command to Discord
      if (line.includes('JFEEDBACK: BAN: ')) {
        line = line.splice('JFEEDBACK: BAN: '.length);
        line = line.split(' ');
        //somehow pass to index.js that command has worked and player $line[0] has been banned for reason $line[1]
        //return `Player ${line[0]} has been banned for reason ${line[1]}`
        let result = ['ban', line[0], line[1]];
        return result

      }
      else if (line.includes('JFEEDBACK: UNBAN: ')) {
        line = line.splice('JFEEDBACK: UNBAN: '.length);
        //somehow pass to index.js that command has worked and player $line[0] has been unbanned
        //return `Player ${line} has been unbanned`
        let result = ['unban', line];
        return result
      }
      else if (line.includes('JFEEDBACK: KICK: ')) {
        line = line.splice('JFEEDBACK: KICK: '.length);
        line = line.split(' ');
        //somehow pass to index.js that command has worked and player $line[0] has been kicked for reason $line[1]
        //return `Player ${line[0]} has been kicked for reason ${line[1]}`
        let result = ['kick', line[0], line[1]];
        return result;
      }
      else if (line.includes('JFEEDBACK: MUTE: ')) {
        line = line.splice('JFEEDBACK: MUTE: ');
        //somehow pass to index.js that command worked and player $line has been muted
        //return `Player ${line} has been muted`
        let result = ['mute', line];
        return result;
      }
      else if (line.includes('JFEEDBACK: UNMUTE: ')) {
        line = line.splice('JFEEDBACK: UNMUTE: ');
        //somehow pass to index.js that command worked and player $line has been unmuted
        //return `Player ${line} has been unmuted`
        let result = ['unmute', line];
        return result;
      }
    }
    else {  //if line is not a feedback for a JammyBot command
      data = readJSON("serverData.js");
      setupObject(data, channel.name);
      data = readJSON('./serverData.json');
      if (line.includes('DIED: ')) {
        line = line.splice('DIED: '.length);
        line = line.split(' '); //split at separation between username and death reson
        //write into data.json, server $channel, players that player $player died because of $reason
        addDeath(data, channel.name, line[0], line[1]);
      }
      else if (line.includes('ROCKET: '))
        rocketLaunched(data, channel.name);
      else if (line.includes('RESEARCH FINISHED: ')) {
        line = line.splice('RESEARCH FINISHED: '.length);
        line = line.split(' ');
        if (line[1] != 0) { // if research is infinite
          //write into data.json, server $channel, research that $line[0] level $line[1] has been researched
          addResearch(data, channel.name, line[0], line[1]);
        }
      }
      writeJSON(data);
      return 0;
    }
  },
  bubbleSort: function (arr) {
    var len = arr.length;

    for (var i = 0; i < len ; i++) {
      for(var j = 0 ; j < len - i - 1; j++){
        if (arr[j] > arr[j + 1]) {
          // swap
          var temp = arr[j];
          arr[j] = arr[j+1];
          arr[j + 1] = temp;
        }
      }
    }
    return arr;
  }
}
