const FIFO = require('fifo-js');
const fs = require('fs');
const { replace } = require('lodash');
const MongoClient = require('mongodb').MongoClient;
const lodash = require('lodash');
const servers = require('./servers.json'); // tails, fifo, discord IDs etc.

let serverFifos = []
Object.keys(servers).forEach(element => {
  serverFifos.push([new FIFO(servers[element].serverFifo), servers[element]]);
})

const { uri } = require('./botconfig.json');
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
const dBclientConnectionPromise = client.connect();


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
        if (data.replace(/(.*:)\s*\[.*=.*\]\s*/g, '') == '') {
          return ''; // if it is only the [] and whitespaces, nothing else
        }
        // These all are for Factorio rich text magic, in order of https://wiki.factorio.com/Rich_text
        // for now, the discord will show [image], [item], [gps] but that can be removed completely by just
        // replacing the second phrase in the .replace with an empty string, i.e. ''
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
      serverFifos.forEach(fifo => {
        fifo.write(`${message.author.username}: ${message.content}`, () => { });
      })
    } else { // sends just the message, no username, nothing because $sendWithUsername is false
      let toSend = message.content || message
      serverFifos.forEach(fifo => {
        fifo.write(`${toSend}`, () => { });
      })
    }
  },
  sendToServer: function (message, sendWithUsername) {
    // The $message given to this function is an object of discord.js - it has the author username, message content, mentions etc.
    // The $sendWithUsername given to the function is a boolean value (fixed from being a 0 or 1). If sendWithUsername is true, it will send the message with the username
    // sends a message to only one server with or without the username

    if (sendWithUsername == true) { //sends the message with the username and colon, as $sendWithUsername is true
      serverFifos.forEach(factorioServer => {
        if (message.channel.id === factorioServer[1].discordChannelID) {
          factorioServer[0].write(`${message.author.username}: ${message.content}`, () => { });
        }
      })
    } else { //sends just the message, no username, nothing as $sendWithUsername is false
      serverFifos.forEach(factorioServer => {
        if (message.channel.id === factorioServer[1].discordChannelID) {
          factorioServer[0].write(`${message.content}`, () => { });
        }
      })
    }
  },
  bubbleSort: function (arr) {
    var len = arr.length;

    for (var i = 0; i < len; i++) {
      for (var j = 0; j < len - i - 1; j++) {
        if (arr[j] > arr[j + 1]) {
          // swap
          var temp = arr[j];
          arr[j] = arr[j + 1];
          arr[j + 1] = temp;
        }
      }
    }
    return arr;
  },
  sortModifiedDate: async function (dir) {
    return new Promise((resolve, reject) => {
      fs.readdir(dir, function (err, files) {
        if (err) reject(err);
        files = files.map(function (fileName) {
          return {
            name: fileName,
            time: fs.statSync(dir + '/' + fileName).mtime.getTime()
          };
        })
          .sort(function (a, b) {
            return b.time - a.time;
          })
          .map(function (v) {
            return v.name;
          });
        resolve(files);
      });
    })
  },
  searchOneDB,
  insertOneDB,
  findOneAndReplaceDB,
  parseJammyLogger,
}

async function searchOneDB(dat, coll, params) {
  await dBclientConnectionPromise; //just wait so the database is connected
  // Returns an object of the thing found or null if not found
  const collection = client.db(dat).collection(coll);
  return collection.findOne(params);
}

async function insertOneDB(dat, coll, params) {
  await dBclientConnectionPromise; //just wait so the database is connected
  // To check if written in correctly, use: ret.result.ok (1 if correctly, 0 if written falsely)
  const collection = client.db(dat).collection(coll);
  return collection.insertOne(params)
}

async function findOneAndReplaceDB(dat, coll, param1, param2) {
  await dBclientConnectionPromise; //just wait so the database is connected
  // To check if written in correctly, use: ret.result.ok (1 if correctly, 0 if written falsely)
  const collection = client.db(dat).collection(coll);
  return collection.findOneAndReplace(param1, param2);
}

async function addDeath(server, player, reason) {
  var res = await searchOneDB(server, "deaths", { player: `${player}` });
  //TODO: somehow find out how the object could be retrieved+written into
  if (res == null) { // if the player wasn't found in the server's database
    var writeObj = {
      player: `${player}`,
      deaths: {
        [reason]: 1,
      }
    }
    var out = await insertOneDB(server, "deaths", writeObj);
    if (out.result.ok !== 1) console.log('error adding to database');
    return;
  } else {
    var replaceWith = lodash.cloneDeep(res); // duplicate the object
    if (replaceWith.deaths[reason])
      replaceWith.deaths[reason]++;
    else
      replaceWith.deaths[reason] = 1;
    var out = await findOneAndReplaceDB(server, "deaths", res, replaceWith);
    return;
  }
  //TODO: add when the player already exists
  return 0;
}
async function addRocket(server) {
  var res = await searchOneDB(server, "stats", { rocketLaunches: { $exists: true } });
  if (res == null) { // if the server wasn't found in the server's database
    var writeObj = {
      rocketLaunches: 1
    }
    var out = await insertOneDB(server, "stats", writeObj);
    if (out.result.ok !== 1) console.log('error adding to database');
    return 1;
  } else {
    var replaceWith = await lodash.cloneDeep(res); // duplicate the object
    if (replaceWith.rocketLaunches)
      replaceWith.rocketLaunches++;
    else
      replaceWith.rocketLaunches = 1;
    var out = await findOneAndReplaceDB(server, "stats", res, replaceWith);
    if (typeof (out) == "object") {
      if (out.ok !== 1) console.log('error adding to database');
    } else {
      console.log(out);
    }
    return replaceWith.rocketLaunches;
  }
}
async function addResearch(server, research, level) {
  var res = await searchOneDB(server, "stats", { research: 'researchData' });
  if (res == null) { // if the server's research wasn't found in the server's database (first research)
    var writeObj = {
      research: 'researchData',
      completedResearch: {
        [research]: level
      }
    }
    var out = await insertOneDB(server, "stats", writeObj);
    if (out.result.ok !== 1) console.log('error adding to database');
    return;
  } else {
    var replaceWith = lodash.cloneDeep(res); // duplicate the object
    if (res.completedResearch[research] <= 1)
      replaceWith.completedResearch[research]++;
    else
      replaceWith.completedResearch[research] = level;
    var out = await findOneAndReplaceDB(server, "stats", res, replaceWith);
    if (typeof (out) == "object") {
      if (out.ok !== 1) console.log('error adding to database');
    } else {
      console.log(out);
    }
  }
  return;
}
function parseJammyLogger(line, channel) { //channel is an object
  //this long asf function parses JammyLogger lines in the console and handles basic statistics
  if (line.includes('JFEEDBACK: ')) { //if line is feedback for a JammyBot command to Discord
    if (line.includes('JFEEDBACK: BAN: ')) {
      line = line.slice('JFEEDBACK: BAN: '.length);
      line = line.split(' ');
      //somehow pass to index.js that command has worked and player $line[0] has been banned for reason $line[1]
      //return `Player ${line[0]} has been banned for reason ${line[1]}`
      let result = ['ban', line[0], line[1]];
      return result

    }
    else if (line.includes('JFEEDBACK: UNBAN: ')) {
      line = line.slice('JFEEDBACK: UNBAN: '.length);
      //somehow pass to index.js that command has worked and player $line[0] has been unbanned
      //return `Player ${line} has been unbanned`
      let result = ['unban', line];
      return result
    }
    else if (line.includes('JFEEDBACK: KICK: ')) {
      line = line.slice('JFEEDBACK: KICK: '.length);
      line = line.split(' ');
      //somehow pass to index.js that command has worked and player $line[0] has been kicked for reason $line[1]
      //return `Player ${line[0]} has been kicked for reason ${line[1]}`
      let result = ['kick', line[0], line[1]];
      return result;
    }
    else if (line.includes('JFEEDBACK: MUTE: ')) {
      line = line.slice('JFEEDBACK: MUTE: ');
      //somehow pass to index.js that command worked and player $line has been muted
      //return `Player ${line} has been muted`
      let result = ['mute', line];
      return result;
    }
    else if (line.includes('JFEEDBACK: UNMUTE: ')) {
      line = line.slice('JFEEDBACK: UNMUTE: ');
      //somehow pass to index.js that command worked and player $line has been unmuted
      //return `Player ${line} has been unmuted`
      let result = ['unmute', line];
      return result;
    }
  } else {  //if line is not a feedback for a JammyBot command
    if (line.includes('DIED: ')) {
      line = line.slice('DIED: '.length);
      line = line.split(' '); //split at separation between username and death reson
      addDeath(channel.name, line[0], line[1]);
      channel.send(`Player \`${line[0]}\` died due to \`${line[1]}\``);
    }
    else if (line.includes('ROCKET: ')) {
      addRocket(channel.name).then((count) => {
        if (count == 1)
          channel.send("Hooray! This server's first rocket has been sent!");
        if (count % 100 == 0)
          channel.send(`${count} rockets have been sent!`);
      })
        .catch((err) => { console.log(err) });

    }
    else if (line.includes('RESEARCH FINISHED: ')) {
      line = line.slice('RESEARCH FINISHED: '.length);
      line = line.split(' ');
      addResearch(channel.name, line[0], line[1]);
      channel.send(`Research \`${line[0]}\` on level \`${line[1]}\` was completed!`);
    }
    return 0;
  }
}