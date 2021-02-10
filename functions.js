/**
 * @file A collection of useful functions that are used across many other files
 */

const fs = require("fs");
const MongoClient = require("mongodb").MongoClient;
const lodash = require("lodash");
const servers = require("./servers.json"); // tails, fifo, discord IDs etc.
const { exec } = require("child_process");
const { PastebinApiToken, testserverchannelid } = require("./botconfig.json");
const { MessageEmbed } = require("discord.js");
const PastebinAPI = require('pastebin-ts');
const { RconConnectionManager } = require("./utils/rcon-connection");
const { CacheManagerClass } = require("./utils/cache-manager");
const { DatabaseConnection } = require('./utils/database-manager')

const { firstJoinMessage } = require("./config/messages.json")

let pastebin = new PastebinAPI(`${PastebinApiToken}`)

module.exports = {
  formatVersion,
  formatDate,
  formatSaveData,
  bubbleSort,
  sortModifiedDate,
  getServerFromChannelInput,
  formatChatData,
  parseJammyLogger,
  getServerList,
  changePoints,
  runShellCommand,
  discordLog,
  awfLogging,
  datastoreInput,
  onJoin,
  sendToPastebin,
  giveFactorioRole,
  removeFactorioRole,
  getFactorioRoles
};
/**
 * @async
 * @description Gets files from a folder and sorts them by date last modified
 * @param {string} dir - Directory to get files from
 * @returns {string=} Array of strings of filenames in order of last modified
 * @example
 * // get the files from ./commands/basic
 * sortModifiedDate("./commands/basic")
 * // returns:
 * [
  'sortdate.js',
  'ping.js',
  'faq.js',
  'help.js',
  'stats.js',
  'uptime.js',
  'xkcd.js'
]
 */
async function sortModifiedDate(dir) {
  return new Promise((resolve, reject) => {
    fs.readdir(dir, function (err, files) {
      if (err) reject(err);
      if (!files) return resolve([])
      files = files
        .map(function (fileName) {
          return {
            name: fileName,
            time: fs.statSync(dir + "/" + fileName).mtime.getTime(),
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
  });
}

/**
 * @description BubbleSort function by string length
 * @param {string=} arr - Array of strings to sort
 * @returns {string} Array of strings sorted by length
 */
function bubbleSort(arr) {
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
}

/**
 * @description Get the name of the save currently saving into
 * @param {string} data - Line of data to format
 * @returns {string} Name of the save
 * @example
 * // returns "_autosave34"
 * formatSaveData("[REGULAR] 41300.079 Info AppManager.cpp:306: Saving to _autosave34 (blocking).")
 */
function formatSaveData(data) {
  return data.slice(data.indexOf("_autosave") + 1, data.indexOf("(") - 1);
}

/**
 * @description Format the date when the server started
 * @param {string} data - Line of server.out output
 * @returns {string} Time
 */
function formatDate(data) {
  data.trim();
  return data.slice(data.indexOf("0.000") + 6, 25);
}

/**
 * @description Get the version of Factorio the server is running
 * @param {string} data - Line of data from server.out
 * @returns {string} Version the server is running
 * @example
 * // returns 1.1.6
 * formatVersion("    0.000 2020-12-20 01:30:07; Factorio 1.1.6 (build 57355, linux64, headless)")
 */
function formatVersion(data) {
  data.trim();
  return data.slice(data.indexOf("Factorio"), data.indexOf("(b")).trim();
}
/**
 * @description Formats chat data from Factorio to send to Discord or other uses. Gets rid of usernames, [CHAT] etc. from raw logs to make nice stuff
 * @function formatChatData
 * @param {string} data - The data you wish to parse
 * @param {bool} keepData - Whether you wish to keep the data that is formatted out from chat. Does nothing as of yet, please keep to true (1) for now
 * @returns {string} The parsed string (line/input)
 * @example
 * // returns "ZTX: here [gps=0, 0], [item]"
 * formatChatData("2020-12-16 20:27:45 [CHAT] ZTX: here [gps=0, 0], [item=iron-plate]", 1)
 **/
function formatChatData(data, keepData) {
  if (data.includes("[CHAT]") || data.includes("(shout)")) {
    data = data.slice(data.indexOf("]") + 2); //removing the [CHAT] from sending to Discord
    if (data.includes("[")) {
      if (data.replace(/(.*:)\s*\[.*=.*\]\s*/g, "") == "") {
        return ""; // if it is only the [] and whitespaces, nothing else
      }
      // These all are for Factorio rich text magic, in order of https://wiki.factorio.com/Rich_text
      // for now, the discord will show [image], [item], [gps] but that can be removed completely by just
      // replacing the second phrase in the .replace with an empty string, i.e. ''
      if (data.includes("[img="))
        return data.replace(/\[img=.*\]/g, keepData ? "[image]" : "");
      if (data.includes("[item="))
        return data.replace(/\[item=.*\]/g, keepData ? "[item]" : "");
      if (data.includes("[entity="))
        return data.replace(/\[entity=.*\]/g, keepData ? "[entity]" : "");
      if (data.includes("[technology="))
        return data.replace(/\[technology=.*\]/g, keepData ? "[research]" : "");
      if (data.includes("[recipe="))
        return data.replace(/\[recipe=.*\]/g, keepData ? "[recipe]" : "");
      if (data.includes("[item-group="))
        return data.replace(
          /\[item-group=.*\]/g,
          keepData ? "[item group]" : ""
        );
      if (data.includes("[fluid="))
        return data.replace(/\[fluid=.*\]/g, keepData ? "[fluid]" : "");
      if (data.includes("[tile="))
        return data.replace(/\[tile=.*\]/g, keepData ? "[tile]" : "");
      if (data.includes("[virtual-signal="))
        return data.replace(
          /\[virutal-signal=.*\]/g,
          keepData ? "[signal]" : ""
        );
      if (data.includes("[achievement="))
        return data.replace(
          /\[achievement=.*\]/g,
          keepData ? "[achievement]" : ""
        );
      if (data.includes("[gps="))
        return data.replace(/\[gps=.*\]/g, keepData ? "[gps]" : "");
      if (data.includes("[special-item="))
        return data.replace(
          /\[special-item=.*\]/g,
          keepData ? "[bp/upgrade/decon]" : ""
        );
      if (data.includes("[armor="))
        return data.replace(/\[armor=.*\]/g, keepData ? "[armor]" : "");
      if (data.includes("[train="))
        return data.replace(/\[train=.*\]/g, keepData ? "[train]" : "");
      if (data.includes("[train-stop="))
        return data.replace(
          /\[train-stop.*\]/g,
          keepData ? "[train stop]" : ""
        );
    }
    return data;
  } else {
    return `**${data.slice(data.indexOf("]") + 2)}**`;
  }
}
/**
 * @description Gets a server object from servers.json from the discord ID of the channel corresponding to the server
 * @param {string} channelID - the channel ID of the server
 * @returns {(Object|null)} The object of the server from servers.json or null if server is not found
 * @example
 * getServerFromChannelInput("723280139982471247")
 * // returns the dev-dump server object - 723280139982471247 is dev-dump's Discord channel ID
 * {
 *  name: "TEST",
 *  discordChannelID: "723280139982471247",
 *  discordChannelName: "dev-dump",
 *  serverOut: "../servers/test/server.out",
 *  serverFifo: "../servers/test/server.fifo",
 *  serverFolderName: "test",
 *  rconPortOffset: 0
 * }
 */
function getServerFromChannelInput(channelID) {
  // gets a server object from channel ID
  let serverKeys = Object.keys(servers);
  for (let i = 0; i < serverKeys.length; i++) {
    if (servers[serverKeys[i]].discordChannelID == channelID) {
      return servers[serverKeys[i]];
    }
  }
  return null;
}

/**
 * @async
 * @description This function adds the role given to the user in the database, so the user gets the role upon connecting
 * @param {string} username - The name of the player
 * @param {string} roleName - The name of the role you want to give to the player
 * @returns {(Object|null)} Output of inserting to database, therefore object with return values, confirmation etc. Returns null if it is in the DB
 * @example
 * // adds "Member" to oof2win2's roles in the database, doesn't actually give the role in-game
 * giveFactorioRole("oof2win2", "Member")
 */
async function giveFactorioRole(username, roleName) {
  // DO NOT USE THIS FUNCTION TO ASSIGN ROLES
  // adds a factorio role to the database
  // give it a SINGLE ROLE NAME, not the existing roles
  let res = await DatabaseConnection.findOneDB("otherData", "playerRoles", {
    factorioName: username,
  });
  if (res == null) {
    let push = {
      factorioName: username,
      roles: [roleName],
    };
    return await DatabaseConnection.insertOneDB("otherData", "playerRoles", push);
  } else {
    let toPush = lodash.cloneDeep(res);
    if (!toPush.roles.includes(roleName)) {
      toPush.roles.push(roleName);
      return await DatabaseConnection.findOneAndReplaceDB("otherData", "playerRoles", res, toPush);
    }
    return false;
  }
}

async function removeFactorioRole(username, roleName) {
  // removes a factorio role to the database
  // give it a SINGLE ROLE NAME, not the existing roles
  let res = await DatabaseConnection.findOneDB("otherData", "playerRoles", {
    factorioName: username,
  });
  if (res === undefined) {
    return false;
  } else {
    let toPush = lodash.cloneDeep(res);
    toPush.roles = toPush.roles.filter(role => {
      return role != roleName
    })
    return await DatabaseConnection.findOneAndReplaceDB("otherData", "playerRoles", res, toPush)
  }
}

/**
 * @async
 * @description Gets the roles of the player requested
 * @param {string} factorioName - In-game username of the player to get roles of
 * @returns {string[]} Array of roles the player has in the database
 * @see {@link giveFactorioRole} how roles are added to database
 * @example
 * // returns ["Member", "Veteran", "Moderator"]
 * getFactorioRoles("oof2win2")
 */
async function getFactorioRoles(factorioName) {
  return DatabaseConnection.findOneDB("otherData", "playerRoles", {
    factorioName: factorioName,
  });
}
/**
 * @async
 * @description Gives a player roles on a specific server, adds the role to the database if the role is not on the player yet
 * @param {string} factorioName - Name of the Factorio player to assign roles to
 * @param {string} role - Role name to assign on server
 * @param {string} serverName - Name of the server as in servers.json
 * @see {@link giveFactorioRole} for adding role to database
 * @example
 * // gives oof2win2 role "Trainee" (they don't have it yet) on server Core
 * givePlayerRoles("oof2win2", "Trainee", "CORE")
 */
async function givePlayerRoles(factorioName, role, serverName) {
  // This function itself doesnt touch the database, that is done by giveFactorioRole
  if (serverName !== undefined) {
    let response = await RconConnectionManager.rconCommand(
      `/interface local names = {} for i, role in ipairs(Roles.get_player_roles("${factorioName}")) do names[i] = role.name end return names`,
      serverName
    );
    if (typeof(response) == "object")
      return console.log(`Error contacting server ${serverName} using RCON`);
    if (response.includes("Unknown command"))
      return console.log(`Server ${serverName} doesn't have the scenario, therefore no role system`);
    response = response[0].slice(0, response[0].indexOf("\n"));
    response = response.slice(
      response.indexOf("{") + 2,
      response.indexOf("}") - 1
    );
    response = response.replace(/"/g, "");
    let currentRoles = response.split(",  ");
    if (!currentRoles.includes(role)) {
      // If the player doesn't have the role, give it to them
      RconConnectionManager.rconCommand(`/assign-role ${factorioName} ${role}`, serverName);
    }
  }
  // assign the role in the database if it is not there yet
  giveFactorioRole(factorioName, role);
}
/**
 * @async
 * @description Adds a death to the player with a reason
 * @param {string} server - The server's corresponding Discord channel name, e.g. awf-regular
 * @param {string} player - Player name
 * @param {string} reason - Reason why player died
 * @example
 * // adds locomitive death to oof2win2 on awf-regular
 * addDeath("awf-regular", "oof2win2", "locomitive")
 */
async function addDeath(server, player, reason) {
  var res = await DatabaseConnection.findOneDB(server, "deaths", { player: `${player}` });
  if (res == null) {
    // if the player wasn't found in the server's database
    var writeObj = {
      player: `${player}`,
      deaths: {
        [reason]: 1,
      },
    };
    var out = await DatabaseConnection.insertOneDB(server, "deaths", writeObj);
    if (out.result.ok !== 1) console.log("error adding to database");
    return;
  } else {
    var replaceWith = lodash.cloneDeep(res); // duplicate the object
    if (replaceWith.deaths[reason]) replaceWith.deaths[reason]++;
    else replaceWith.deaths[reason] = 1;
    var out = await DatabaseConnection.findOneAndReplaceDB(server, "deaths", res, replaceWith);
    return;
  }
}
/**
 * @async
 * @description Adds a rocket launched to the statistics of the Factorio server
 * @param {string} server - The server's corresponding Discord channel name, e.g. awf-regular
 * @example
 * // adds a rocket launched to awf-regular
 * addRocket("awf-regular")
 */
async function addRocket(server) {
  var res = await DatabaseConnection.findOneDB(server, "stats", {
    rocketLaunches: { $exists: true },
  });
  if (res == null) {
    // if the server wasn't found in the server's database
    var writeObj = {
      rocketLaunches: 1,
    };
    var out = await DatabaseConnection.insertOneDB(server, "stats", writeObj);
    if (out.result.ok !== 1) console.log("error adding to database");
    return 1;
  } else {
    var replaceWith = await lodash.cloneDeep(res); // duplicate the object
    if (replaceWith.rocketLaunches) replaceWith.rocketLaunches++;
    else replaceWith.rocketLaunches = 1;
    var out = await DatabaseConnection.findOneAndReplaceDB(server, "stats", res, replaceWith);
    if (typeof out == "object") {
      if (out.ok !== 1) console.log("error adding to database");
    } else {
      console.log(out);
    }
    return replaceWith.rocketLaunches;
  }
}
/**
 * @async
 * @description Adds a research to the statistics of the Factorio server
 * @param {string} server - The server's corresponding Discord channel name, e.g. awf-regular
 * @param {string} research - Research name
 * @param {number} level - Level of research
 */
async function addResearch(server, research, level) {
  var res = await DatabaseConnection.findOneDB(server, "stats", { research: "researchData" });
  if (level < 1) level = 1;
  if (res == null) {
    // if the server's research wasn't found in the server's database (first research)
    var writeObj = {
      research: "researchData",
      completedResearch: {
        [research]: level,
      },
    };
    var out = await DatabaseConnection.insertOneDB(server, "stats", writeObj);
    if (out.result.ok !== 1) console.log("error adding to database");
    return;
  } else {
    var replaceWith = lodash.cloneDeep(res); // duplicate the object
    if (res.completedResearch[research] <= 1)
      replaceWith.completedResearch[research]++;
    else replaceWith.completedResearch[research] = level;
    var out = await DatabaseConnection.findOneAndReplaceDB(server, "stats", res, replaceWith);
    if (typeof out == "object") {
      if (out.ok !== 1) console.log("error adding to database");
    } else {
      console.log(out);
    }
  }
  return;
}
/**
 * @async
 * @description Parses a line of Jammy logging. Handles statistics, deaths, rockets etc.
 * @param {string} line - Line of Jammy logging input
 * @param {Object} channel - Discord channel object of corresponding Factorio server's channel
 * @see {@link addRocket} for  adding rockets
 * @see {@link addDeath} for adding deaths
 * @see {@link addResearch} for adding research
 * @see {@link changePoints} for changing points
 * @example
 * // parse this line into points (logged by the AwF scenario)
 * // first number (116) is number of entities built, second number (43180) is number of ticks played
 * // both measured since last time played
 * parseJammyLogger("JLOGGER: STATS: Windsinger 116 43180", awf-regularChannelObject)
 */
async function parseJammyLogger(line, channel) {
  //channel is a Discord channel object
  //this long asf function parses JammyLogger lines in the console and handles basic statistics
  if (line.includes("DIED: ")) {
    line = line.slice("DIED: ".length);
    line = line.split(" "); //split at separation between username and death reson
    if (line[0].includes("PLAYER: ")) {
      line[0] = line[0].slice("PLAYER: ".length);
      line[1] = `Player ${line[1]}`;
    }
    if (line[0] == "PLAYER:") line.shift();
    addDeath(channel.name, line[0], line[1]);
    channel.send(`Player \`${line[0]}\` died due to \`${line[1]}\``);
    let user = await DatabaseConnection.findOneDB("otherData", "linkedPlayers", {
      factorioName: line[0],
    });
    if (user == null) return; //non-linked user
    changePoints(user, 0, 0, 1); //0 built, 0 time but 1 death
  } else if (line.includes("ROCKET: ")) {
    addRocket(channel.name)
      .then((count) => {
        if (count == 1)
          channel.send("Hooray! This server's first rocket has been sent!");
        if (count % 100 == 0) channel.send(`${count} rockets have been sent!`);
      })
      .catch((err) => {
        console.log(err);
      });
  } else if (line.includes("RESEARCH FINISHED: ")) {
    line = line.slice("RESEARCH FINISHED: ".length);
    line = line.split(" ");
    addResearch(channel.name, line[0], line[1]);
    channel.send(
      `Research \`${line[0]}\` on level \`${line[1]}\` was completed!`
    );
  } else if (line.includes("STATS: ")) {
    line = line.slice("STATS: ".length);
    line = line.split(" ");
    let username = line[0]; // username from line
    let built = parseInt(line[1]); // first part of the line
    let time = parseInt(line[2]); // second part of the line
    time = time / (60 * 60); // get time into minutes
    let user = await DatabaseConnection.findOneDB("otherData", "linkedPlayers", {
      factorioName: username,
    });
    if (user == null) return; //non-linked user
    let resp = await changePoints(user, built, time);
    if (resp[0].time > 60) {
      // give Veteran role if player has more than 1h (60m) played across all servers
      let roles = await getFactorioRoles(user.factorioName);
      if (roles != null) {
        roles = roles.roles;
        if (!roles.includes("Veteran")) {
          let factorioServer = getServerFromChannelInput(channel.id);
          givePlayerRoles(user.factorioName, "Veteran", factorioServer.name);
        }
      }
    }
  }
}
/**
 * @description Gets the list of servers
 * @returns {Array<string>} Array of strings (server folder names)
 */
function getServerList() {
  let serverNames = [];
  Object.keys(servers).forEach((element) => {
    if (servers[element].serverFolderName !== "")
      serverNames.push(servers[element].serverFolderName);
  });
  return serverNames;
}
/**
 * @async
 * @description Runs a shell command under the user the bot is running under, e.g. factorio. commands can be linked with standard linkers, ; and &&. Rejects when stderr or error
 * @param {string} cmd - Command to execute in shell
 * @returns {Promise<(Error|string|Buffer)>}
 * @see {@link https://nodejs.org/api/child_process.html#child_process_child_process_exec_command_options_callback Child Process} Node docs
 */
async function runShellCommand(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, function (error, stdout, stderr) {
      if (stdout) resolve(stdout);
      if (stderr) reject(stderr);
      if (error) reject(error);
    });
  });
}

/**
 * @async
 * @description Changes the amount of points the player has in the database
 * @param {Object} user - Object of the user, same as linked user: {discordID: "discord id", factorioName: "factorio name"}
 * @param {Number} built - Number of entities built to add to statistics
 * @param {Number} time - Number of minutes the user has played
 * @param {Number} death - number of deaths
 * @see {@link DatabaseConnection.findOneDB} to see how searching database is done
 * @see {@link DatabaseConnection.findOneAndReplaceDB} to how replacing in database is done
 * @returns {Array<Object>} an array of the object the data was replaced with, object of the user inputted
 * @example
 * // ex1: oof2win2 built 68 entities and played 93 minutes
 * changePoints({factorioName: "oofw2win2", discordID: "69420"}, 68, 93, 0)
 * // ex2: oof2win2 died once
 * changePoints({factorioName: "oofw2win2", discordID: "69420"}, 0, 0, 1)
 */
async function changePoints(user, built, time, death = 0) {
  var res = await DatabaseConnection.findOneDB("otherData", "globPlayerStats", {
    discordID: user.discordID,
  });
  if (res == null) {
    pushData = {
      discordID: user.discordID,
      timePlayed: 0, // number of time played (in minutes)
      time: 0, // points for time played
      built: 0,
      deaths: 0,
      points: 0,
    };
    res = pushData;
  }
  let replaceWith = lodash.cloneDeep(res);
  if (replaceWith.time) replaceWith.time += time;
  else replaceWith.time = time;
  if (replaceWith.built) replaceWith.built += built;
  else replaceWith.built = built;
  if (death != 0) {
    if (replaceWith.deaths) replaceWith.deaths += death;
    else replaceWith.deaths = death;
    replaceWith.points -= 100 * death; //-100pts for death
  }
  if (replaceWith.points == null) replaceWith.points = 0;
  replaceWith.points += built;
  replaceWith.points += (time / 60) * 50; //50 pts/h
  await DatabaseConnection.findOneAndReplaceDB("otherData", "globPlayerStats", res, replaceWith);
  return [replaceWith, user];
}

let LinkingCache = new CacheManagerClass({
  checkperiod: 120,
  stdTTL: 1800, // auto expires after 15 mins
});
module.exports.LinkingCache = LinkingCache;
/**
 * @async
 * @description Parse logging of lines from script-output/ext/awflogging.out into various things, for now joining, leaving and linking
 * @param {string} line - String to be parsed
 * @param {string} discordChannelID - Channel ID of the Discord server corresponding to the Factorio server the line has been sent from
 * @param {Object} discordClient - Discord client object
 * @example
 * // log oof2win2 joining dev-dump
 * awfLogging(`{"type":"join","playerName":"oof2win2"}`, "723280139982471247", discordClient)
 */
async function awfLogging(line, discordChannelID, discordClient) {
  let logObject = JSON.parse(line);
  /* 
  example objects of input:
  {"type":"join","playerName":"oof2win2"} 
  {"type":"leave","playerName":"oof2win2","reason":"banned"}
  {"type":"link","playerName":"oof2win2","discordName":"oof2win2"}
  */

  if (logObject.type == "link") {
    if (logObject.linkID !== undefined)
      LinkingCache.set(logObject.linkID, logObject.playerName);
    else {
      // backwards compatibility. new saves use the new method
      linkFactorioDiscordUser(
        discordClient,
        logObject.playerName,
        logObject.discordName,
        discordChannelID
      );
    }
  } else if (logObject.type == "join") {
    discordClient.channels.cache
      .get(discordChannelID)
      .send(`**Player \`${logObject.playerName}\` has joined the game**`);
  } else if (logObject.type == "leave") {
    discordClient.channels.cache
      .get(discordChannelID)
      .send(
        `**Player \`${logObject.playerName}\` has left the game due to reason \`${logObject.reason}\`**`
      );
  }
}
/**
 * @async
 * @description Log specific things (bans, kicks, jails etc.) to Discord
 * @param {string} line - Message embed to send to the channel - input is literraly an already done Discord MessageEmbed
 * @param {string} discordChannelID - Channel ID of the Discord server corresponding to the Factorio server the line has been sent from
 * @param {Object} discordClient - Discord client object
 * @see Factorio Scenario ({@link https://github.com/oof2win2/AwF-Scenario GitHub repo})
 * @example
 * // oof2win2 used /c
 * discordLog("{"title":"C","description":"/c was used","color":"0x808080","fields":[{"name":"Server Details","value":"Server: ${serverName} Time: 1 days 0 hours 18 minutes\nTotal: 7 Online: 1 Admins: 1"},{"name":"By","value":"oof2win2","inline":true},{"name":"Details","value":"game.reload_script()","inline":true}]}", "723280139982471247", discordClient)
 */
async function discordLog(line, discordChannelID, discordClient) {
  // example input
  // {"title":"C","description":"/c was used","color":"0x808080","fields":[{"name":"Server Details","value":"Server: ${serverName} Time: 1 days 0 hours 18 minutes\nTotal: 7 Online: 1 Admins: 1"},{"name":"By","value":"oof2win2","inline":true},{"name":"Details","value":"game.reload_script()","inline":true}]}
  if (discordChannelID == testserverchannelid) return;
  let objLine = JSON.parse(line);
  objLine.fields[0].value = objLine.fields[0].value.replace(
    "${serverName}",
    discordClient.channels.cache.get(discordChannelID)
  );
  let embed = new MessageEmbed(objLine);
  discordClient.channels.cache.get(discordChannelID).send(embed);
  return discordClient.channels.cache.get("697146357819113553").send(embed); // moderators channel
}
/**
 * @async
 * @description Input to the datastore (parsing from script-output/ext/datastore.out). Searches/adds data in database otherData, it's up to the server to handle the collection name
 * @param {string} line - Line from datastore.out to parse
 * @param {string} discordChannelID - ID of the Discord channel corresponding to the server
 * @param {Object} discordClient - Discord client object
 * @param {string} discordChannelName - Name of the Discord channel corresponding to the Factorio server
 * @param {Object} serverObject - Object of the server from servers.json
 * @see Factorio Scenario ({@link https://github.com/oof2win2/AwF-Scenario GitHub repo})
 * @example
 * // This line from datastore.out is requesting the playerData of player oof2win2, so we give the function
 * // the ID of the channel, Discord client, channel name and Discord object.
 * // In different types ("request" can be other things, see scenario), this function can work with the database
 * // in different ways
 * datastoreInput("request PlayerData oof2win2", "723280139982471247", discordClient, "dev-dump", serverObject)
 */
async function datastoreInput(
  line,
  discordChannelID,
  discordClient,
  discordChannelName,
  serverObject
) {
  let args = line.split(" ");
  const requestType = args.shift();
  const collectionName = args.shift();
  const playerName = args.shift();
  const factorioServer = getServerFromChannelInput(discordChannelID);
  line = line.slice(
    // +3 for spaces
    requestType.length + collectionName.length + playerName.length + 3
  );
  if (requestType == "request") {
    // request from database and send back to server
    let find = await DatabaseConnection.findOneDB("otherData", collectionName, {
      playername: playerName,
    });
    let send;
    if (find == null) send = "";
    else send = JSON.stringify(find.data);
    RconConnectionManager.rconCommand(
      `/interface Datastore.ingest('request', '${collectionName}', '${playerName}', '${send}')`,
      factorioServer.name
    );
  } else if (requestType == "message") {
    // send to all servers without saving
    RconConnectionManager.rconCommandAll(
      // args is now the rest of the stuff
      `/interface Datastore.ingest('message', '${collectionName}', '${playerName}', '${args}')`
    );
  } else if (requestType == "propagate") {
    // send to all servers except the server the request is coming from and send to database
    RconConnectionManager.rconCommandAllExclude(
      // args is now the rest of the stuff
      `/interface Datastore.ingest('propagate', '${collectionName}', '${playerName}', '${args}')`,
      [`${serverObject.name}`]
    );
    let find = await DatabaseConnection.findOneDB("otherData", collectionName, {
      playername: playerName,
    });
    if (find == null) {
      let send = {
        playername: playerName,
        data: JSON.parse(args),
      };
      DatabaseConnection.insertOneDB("otherData", collectionName, send);
    } else {
      let send = lodash.cloneDeep(find);
      send.data = JSON.parse(args);

      DatabaseConnection.findOneAndReplaceDB("otherData", collectionName, find, send);
    }
  } else if (requestType == "save") {
    // save to database
    let find = await DatabaseConnection.findOneDB("otherData", collectionName, {
      playername: playerName,
    });
    if (find == null) {
      let send = {
        playername: playerName,
        data: JSON.parse(line),
      };
      DatabaseConnection.insertOneDB("otherData", collectionName, send);
    } else {
      let send = lodash.cloneDeep(find);
      send.data = JSON.parse(line);
      DatabaseConnection.findOneAndReplaceDB("otherData", collectionName, find, send);
    }
  } else if (requestType == "remove") {
    // remove from database
    let toDelete = {
      playername: playerName,
      data: JSON.parse(args),
    };
    DatabaseConnection.deleteOneDB("otherData", collectionName, toDelete);
  }
}
/**
 * @async
 * @description What is done when a player joins a server
 * @param {string} playerName - Name of the player joined
 * @param {string} discordChannel - ID of the Discord channel corresponding to the Factorio server
 * @param {Object} discordClient - Discord client object
 * @see Factorio Scenario ({@link https://github.com/oof2win2/AwF-Scenario GitHub repo})
 * @example
 * // oof2win2 joined dev-dump, which has channel ID of 723280139982471247
 * onJoin("oof2win2", "723280139982471247", discordClient)
 */
async function onJoin(playerName, discordChannelID, discordClient) {
  const froles = await getFactorioRoles(playerName);
  const joinedServer = getServerFromChannelInput(discordChannelID);
  if (froles == null) {
    RconConnectionManager.rconCommand(`/whisper ${playerName} ${firstJoinMessage}`, joinedServer.name);
  } else {
    froles.roles.forEach((role) => {
      givePlayerRoles(playerName, role, joinedServer.name);
    });
  }
}

/**
 * @async
 * @description Uploads a long string to Pastebin
 * @param {string} toUpload - String to upload. Can also be a file path
 * @param {bool} mode - Whether string is a file or not
 * @returns {string} Link of Pastebin paste
 */
async function sendToPastebin(paste, mode = false, pasteName = undefined) {
  if (mode) {
    let pasteRes = await pastebin.createPaste(paste, pasteName)
    return pasteRes;
  } else {
    let pasteRes = await pastebin.createPasteFromFile(paste, pasteName)
    return pasteRes;
  }
}