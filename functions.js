const FIFO = require('fifo-js');
const fs = require('fs');
const { replace } = require('lodash');
const MongoClient = require('mongodb').MongoClient;
const lodash = require('lodash');
const servers = require('./servers.json'); // tails, fifo, discord IDs etc.
const { exec } = require('child_process');

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
        fifo[0].write(`${message.author.username}: ${message.content}`, () => { });
      })
    } else { // sends just the message, no username, nothing because $sendWithUsername is false
      let toSend = message.content || message
      serverFifos.forEach(fifo => {
        fifo[0].write(`${toSend}`, () => { });
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
  deleteOneDB,
  parseJammyLogger,
  getServerList,
  linkFactorioDiscordUser,
  changePoints,
  runShellCommand,
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
  return collection.insertOne(params);
}
async function findOneAndReplaceDB(dat, coll, param1, param2) {
  await dBclientConnectionPromise; //just wait so the database is connected
  // To check if written in correctly, use: ret.result.ok (1 if correctly, 0 if written falsely)
  const collection = client.db(dat).collection(coll);
  return collection.findOneAndReplace(param1, param2);
}
async function deleteOneDB(dat, coll, params, filter) {
  // deletes the data object {params} from the database dat collection coll
  // filter is what to delete, see https://docs.mongodb.com/manual/reference/method/db.collection.deleteOne
  // if filter is {}, it will delete the first thing found
  await dBclientConnectionPromise; //just wait so the database is connected
  // To check if written in correctly, use: ret.acknowledged (1 if correctly, 0 if written falsely)
  const collection = client.db(dat).collection(coll);
  return collection.deleteOne(params);
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
async function parseJammyLogger(line, channel) { //channel is an object
  //this long asf function parses JammyLogger lines in the console and handles basic statistics
  if (line.includes('DIED: ')) {
    line = line.slice('DIED: '.length);
    line = line.split(' '); //split at separation between username and death reson
    if (line[0].includes('PLAYER: ')) {
      line[0] = line[0].slice('PLAYER: '.length);
      line[1] = `Player ${line[1]}`;
    }
    addDeath(channel.name, line[0], line[1]);
    channel.send(`Player \`${line[0]}\` died due to \`${line[1]}\``);
    let user = await searchOneDB("otherData", "linkedPlayers", { factorioName: line[0] });
    if (user == null) return; //non-linked user
    changePoints(user, 0, 0, 1); //0 built, 0 time but 1 death
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
  else if (line.includes('STATS: ')) {
    line = line.slice('STATS: '.length);
    line = line.split(' ');
    let username = line[0] // username from line
    let built = parseInt(line[1]);   // first part of the line
    let time  = parseInt(line[2]);   // second part of the line
    time = (time / (60 * 60)) // get time into minutes
    let user = await searchOneDB("otherData", "linkedPlayers", { factorioName: username });
    if (user == null) return; //non-linked user
    changePoints(user, built, time)
  }
}
async function linkFactorioDiscordUser(discordClient, factorioName, discordName) {
  //links the Factorio and Discord usernames, can be used for verification later
  //discordName is the name and tag of the user, e.g. SomeRandomPerson#0000
  let server = await discordClient.guilds.cache.get('548410604679856151');
  let sendToUser = await server.members.fetch({query: discordName, limit: 1});
  sendToUser = sendToUser.first()
  let sentMsg = await sendToUser.send(`You have chosen to link your Discord account, \`${discordName}\` with your Factorio account on AwF, \`${factorioName}\`. The request will timeout after 120s. React with 🛑 to re-link your account. If complications arise, please contact devs/admins (relinking is when switching Factorio username, for switching Discord account contact admins/devs. Changing your Discord username **IS NOT** changing an account, whilst changing your Factorio username **is**)`);
  sentMsg.react('✅')
  sentMsg.react('❌')
  sentMsg.react('🛑')
  const filter = (reaction, user) => {
    return user.id === sendToUser.id;
  };
  sentMsg.awaitReactions(filter, { max: 1, time: 120000, errors: ['time'] })
    .then(async(messageReaction) => {
      let reaction = messageReaction.first();
      if (reaction.emoji.name === '❌') return sendToUser.send('Linking cancelled');
      let dat = { factorioName: factorioName, discordID: sendToUser.id };
      let found = await searchOneDB("otherData", "linkedPlayers", { discordID: sendToUser.id });
      if (found !== null && reaction.emoji.name === '🛑') { // re-link user
        let res = await findOneAndReplaceDB("otherData", "linkedPlayers", found, dat);
        if (res.ok != 1) return sendToUser.send('Please contact devs/admins for re-linking, process failed');
        //redo statistics
        let prevStats = await searchOneDB("otherData", "globPlayerStats", { discordID: found.discordID });
        let newStats = lodash.cloneDeep(prevStats);
        newStats.factorioName = factorioName;
        res = await findOneAndReplaceDB("otherData", "globPlayerStats", prevStats, newStats);
        if (res.ok != 1) return sendToUser.send('Please contact devs/admins for re-linking, process failed');
        return sendToUser.send('Re-linked succesfully!')
      }
      else if (found !== null && reaction.emoji.name === '✅') // cancel
        return sendToUser.send('Already linked');
      else if (found === null) {
        let res = await insertOneDB("otherData", "linkedPlayers", dat);
        if (res.result.ok == 0) return sendToUser.send('Failed linking. Contact devs/admins');
        else return sendToUser.send('Linked successfully');
      }
    })
    .catch((out) => {
      if (out.size == 0) return sendToUser.send(`Didn't react in time. Please try again.`);
    })
}
async function changePoints(user, built, time, death=0) {
  let res = await searchOneDB("otherData", "globPlayerStats", { discordID: user.discordID });
  if (res == null) {
    pushData = {
      discordID: user.discordID,
      timePlayed: 0,
      time: 0, // points for time played
      built: 0,
      deaths: 0,
      points: 0,
    }
    await insertOneDB("otherData", "globPlayerStats", pushData);
    res = pushData;
  } else {
    let replaceWith = lodash.cloneDeep(res);
    if (replaceWith.time) replaceWith.time += time;
    else replaceWith.time = time;
    if (replaceWith.built) replaceWith.built += built;
    else replaceWith.built = built;
    if (death != 0) {
      if (replaceWith.deaths) replaceWith.deaths += death;
      else replaceWith.deaths = death;
      replaceWith.points -= 100*death;    //-100pts for death
    }
    if (replaceWith.points == null) replaceWith.points = 0
    replaceWith.points += built;
    replaceWith.points += (time / 60) * 50; //50 pts/h
    await findOneAndReplaceDB("otherData", "globPlayerStats", res, replaceWith);
  }
}
function getServerList() {
  let serverNames = []
  Object.keys(servers).forEach(element => {
    if (servers[element].serverFolderName !== '')
      serverNames.push(servers[element].serverFolderName);
  })
  return serverNames;
}

async function runShellCommand(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, function (error, stdout, stderr) {
      if (stdout) resolve(stdout);
      if (stderr) reject(stderr);
      if (error) reject(error);
    });
  })
}