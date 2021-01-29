/**
 * @file A collection of useful functions that are used across many other files
 */

const FIFO = require("fifo-js");
const fs = require("fs");
const MongoClient = require("mongodb").MongoClient;
const lodash = require("lodash");
const servers = require("./servers.json"); // tails, fifo, discord IDs etc.
const { exec } = require("child_process");
const { uri, rconport, rconpw, PastebinApiToken, testserverchannelid } = require("./botconfig.json");
const Rcon = require("rcon-client");
const { MessageEmbed } = require("discord.js");
const { request } = require("http");
const PastebinAPI = require('pastebin-ts');

let pastebin = new PastebinAPI(`${PastebinApiToken}`)

let serverFifos = [];
Object.keys(servers).forEach((element) => {
  serverFifos.push([new FIFO(servers[element].serverFifo), servers[element]]);
});

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const dBclientConnectionPromise = client.connect();

module.exports = {
  formatVersion,
  formatDate,
  formatSaveData,
  sendToAll,
  sendToServer,
  bubbleSort,
  sortModifiedDate,
  getServerFromChannelInput,
  formatChatData,
  searchOneDB,
  insertOneDB,
  findOneAndReplaceDB,
  deleteOneDB,
  deleteManyDB,
  parseJammyLogger,
  getServerList,
  linkFactorioDiscordUser,
  changePoints,
  runShellCommand,
  rconCommand,
  rconCommandAll,
  discordLog,
  awfLogging,
  datastoreInput,
  onJoin,
  sendToPastebin,
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
 * @description Sends a message to only one server. Use the new utils/fifo-manager class instead!
 * @deprecated
 * @param {Object} message - Discord message object to send to Factorio server. Used for which server to send to by getting the server by channel ID
 * @param {bool} sendWithUsername - Whether to send with username or not
 */
function sendToServer(message, sendWithUsername) {
  if (sendWithUsername == true) {
    //sends the message with the username and colon, as $sendWithUsername is true
    serverFifos.forEach((factorioServer) => {
      if (message.channel.id === factorioServer[1].discordChannelID) {
        factorioServer[0].write(
          `${message.author.username}: ${message.content}`,
          () => {}
        );
      }
    });
  } else {
    //sends just the message, no username, nothing as $sendWithUsername is false
    serverFifos.forEach((factorioServer) => {
      if (message.channel.id === factorioServer[1].discordChannelID) {
        factorioServer[0].write(`${message.content}`, () => {});
      }
    });
  }
}

/**
 * @description Send a message to all servers (announcement or something). Use the new utils/fifo-manager class instead!
 * @deprecated
 * @param {Object} message - Message to send, format of DiscordMessage
 * @param {bool} sendWithUsername - Whether to send message with username or not
 */
function sendToAll(message, sendWithUsername) {
  // The $message given to this function is an object of discord.js - it has the author username, message content, mentions etc.
  // The $sendWithUsername given to the function is a boolean value (fixed from being a 0 or 1). If sendWithUsername is true, it will send the message with the username
  // sends a message to all servers at once
  if (sendWithUsername) {
    // $sendWithUsername is true, therefore the message is sent with the username
    serverFifos.forEach((fifo) => {
      fifo[0].write(`${message.author.username}: ${message.content}`, () => {});
    });
  } else {
    // sends just the message, no username, nothing because $sendWithUsername is false
    let toSend = message.content || message;
    serverFifos.forEach((fifo) => {
      fifo[0].write(`${toSend}`, () => {});
    });
  }
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
 * @description Search for one item in the database
 * @param {string} databaseName - Database name
 * @param {string} collectionName - Collection name
 * @param {Object} toSearch - "Key" to search for/with
 * @returns {(Object|null)} Object from database's collection or null if not found
 * @see {@link http://mongodb.github.io/node-mongodb-native/3.6/api/Collection.html#findOne MongoCollection#findOne} for how the function works in more detail
 * @example
 * // returns the object with a property factorioName with the value "oof2win2"
 * await searchOneDB("otherData", "linkedPlayers", {factorioName: "oof2win2"})
 */
async function searchOneDB(databaseName, collectionName, toSearch) {
  await dBclientConnectionPromise; //just wait so the database is connected
  // Returns an object of the thing found or null if not found
  const collection = client.db(databaseName).collection(collectionName);
  return collection.findOne(toSearch);
}
/**
 * @async
 * @description Inserts an object into a specified database's collection
 * @param {string} databaseName - Database name
 * @param {string} collectionName - Collection name
 * @param {Object} toInsert - Object to insert to the database
 * @returns {Object} Object with return values, e.g. the ID of the object, return status etc
 * @see {@link http://mongodb.github.io/node-mongodb-native/3.6/api/Collection.html#insertOne MongoCollection#insertOne} for how the function works
 * @example
 * // inserts {factorioName: "oof2win2", discordID: "6684"} into the database otherData collection linkedPlayers
 * await insertOneDB("otherData", "linkedPlayers", {factorioName: "oof2win2", discordID: "6684"})
 */
async function insertOneDB(databaseName, collectionName, toInsert) {
  await dBclientConnectionPromise; //just wait so the database is connected
  // To check if written in correctly, use: ret.result.ok (1 if correctly, 0 if written falsely)
  const collection = client.db(databaseName).collection(collectionName);
  return collection.insertOne(toInsert);
}
/**
 * @async
 * @description Finds specified object and replaces it in the database's collection.
 * @see {@link searchOneDB} to get the object to search for
 * @param {string} databaseName - Database to find and replace in
 * @param {string} collectionName - Collection of database to find and replace in
 * @param {Object} toFind - Object to find (key)
 * @param {Object} toReplace - Object to replace
 * @returns {Object} The original document (toFind) or the document that it has been replaced with (toReplace)
 * @see {@link http://mongodb.github.io/node-mongodb-native/3.6/api/Collection.html#findOneAndReplace MongoCollection#findOneAndReplace} for how the function works
 * @example
 * // Will replace oof2win2's playtime from 1 to 900
 * findOneAndReplaceDB("otherData", "stats", {playerName: "oof2win2", playtime: 1}, {playerName: "oof2win2", playtime: 900})
 */
async function findOneAndReplaceDB(databaseName, collectionName, toFind, toReplace) {
  await dBclientConnectionPromise; //just wait so the database is connected
  // To check if written in correctly, use: ret.result.ok (1 if correctly, 0 if written falsely)
  const collection = client.db(databaseName).collection(collectionName);
  return collection.findOneAndReplace(toFind, toReplace);
}
/**
 * @async
 * @description Finds and deletes the specified object from the database's collection
 * @see {@link searchOneDB} to get the object to delete
 * @param {string} databaseName
 * @param {string} collectionName
 * @param {Object} params - The object to delete
 * @returns {Object} Object containing: A boolean acknowledged as true if the operation ran with write concern or false if write concern was disabled; deletedCount containing the number of deleted documents
 * @see {@link http://mongodb.github.io/node-mongodb-native/3.6/api/Collection.html#deleteOne MongoCollection#deleteOne}
 * @example
 * // deletes the object {playerName: "oof2win2", playtime: 6000} from otherData's collection linkedPlayers
 * deleteOneDB("otherData", "linkedPlayers", {playerName: "oof2win2", playtime: 6000})
 */
async function deleteOneDB(databaseName, collectionName, params) {
  // deletes the data object {params} from the database dat collection coll
  // filter is what to delete, see https://docs.mongodb.com/manual/reference/method/db.collection.deleteOne
  // if params is {}, it will delete the first thing found
  await dBclientConnectionPromise; //just wait so the database is connected
  // To check if written in correctly, use: ret.acknowledged (1 if correctly, 0 if written falsely)
  const collection = client.db(databaseName).collection(collectionName);
  return collection.deleteOne(params);
}
/**
 * @async
 * @description Deletes many objects from the database's collection
 * @param {string} databaseName - Name of the database to delete from
 * @param {string} collectionName - Name of the collection to delete from
 * @param {Object} filter - Filter object of what to delete/what to keep
 * @returns {Promise<Object>}
 * @see {@link http://mongodb.github.io/node-mongodb-native/3.6/api/Collection.html#deleteMany MongoCollection#deleteMany}
 */
async function deleteManyDB(databaseName, collectionName, filter) {
  await dBclientConnectionPromise; // wait so the database is connected before doing anything
  const collection = client.db(databaseName).collection(collectionName);
  return collection.deleteMany(filter);
}
/**
 * @async
 * @description Sends a Factorio command to RCON.
 * @param {string} command - Command to send to the server (auto-prefixed with '/')
 * @param {string} serverName - Name of the server according to the name parameter in servers.json
 * @returns {string[]} Returns an array with 2 elements, first being command output (string). Second element is either a blank string, or a string beginning with "error:" and containing the error given
 * @example
 * // sends /time to server with name TEST in servers.json
 * // returns ["2 days, 28 minutes and 1 second", ""] when succesfull
 * // returns ["", "error: stuff"] when unsuccesfull
 * rconCommand(`/time`, "TEST")
 */
async function rconCommand(command, serverName) {
  if (!command.startsWith("/")) command = `/${command}`; //add a '/' if not present
  let server;
  Object.keys(servers).forEach((s) => {
    if (servers[s].name == serverName) server = servers[s];
  });
  if (server == null)
    return ["", `error: no server corresponding to ${serverName}`];
  let port = parseInt(rconport) + parseInt(server.rconPortOffset); // the port to connect to, ports are one after another
  try {
    const rcon = new Rcon.Rcon({
      host: "127.0.0.1",
      port: `${port}`,
      password: `${rconpw}`,
    });
    // rcon.on("connect", () => { console.log(`connected ${serverName}`)}); //why spam console
    rcon.on("error", (e) => {
      console.log(`rcon error ${serverName}: ${e}`);
    });
    // rcon.on("authenticated", () => console.log(`authenticated ${serverName}`)); //why spam console
    // rcon.on("end", () => console.log(`end ${serverName}`)); //why spam console

    await rcon.connect(); // wait for connecting before continuing
    let res = await rcon.send(command);
    let responseType;
    if (typeof res == "string" && res.length) responseType = "";
    else responseType = "error";
    rcon.end();
    return [res, responseType];
  } catch (err) {
    if (err.stack.startsWith(`Error: connect ECONNREFUSED`)) {
      console.log(
        `Connection Error --- Details --- \nNAME: ${err.name} \nDESC: ${err.description} \nStack: ${err.stack}`
      );
    } else {
      console.log(
        `Connection Error --- Details --- \nNAME: ${err.name} \nDESC: ${err.description} \nStack: ${err.stack}`
      );
    }
    return [err, "error"];
  }
}
/**
 * @async
 * @description Like the function rconCommand but sends the RCON command to all servers
 * @param {string} command - Command to send to server (auto prefixed with '/')
 * @returns {Array<Array, string>} Returns an array of command outputs (arrays) and errors (strings), with the command outputs being same as rconCommand: either ["2 days, 28 minutes and 1 second", ""] or ["", "error: stuff"] if an error occurs. Example return is [["2 days, 28 minutes and 1 second", ""], "CORE"]
 * @see {@link rconCommand} to see how the RCON commands work
 * @example
 * // sends /time to all servers
 * // returns [[["2 days, 28 minutes and 1 second", ""], "CORE"], [["19 days, 5 minutes and 1 second", ""], "AWF-REG"]]
 * // the number of returns and return values depends on the number of servers and age of servers respectively
 * await rconCommandAll("/time")
 */
async function rconCommandAll(command) {
  if (!command.startsWith("/")) command = `/${command}`; //add a '/' if not present
  let serverNames = [];
  Object.keys(servers).forEach((s) => {
    serverNames.push(servers[s]);
  });
  let promiseArray = serverNames.map((server) => {
    return new Promise((resolve) => {
      rconCommand(command, server.name)
        .then((res) => {
          if (!res[1].startsWith("error")) {
            resolve([res, server.name]);
          } else {
            resolve([res, server.name]);
          }
        })
        .catch((e) => {
          reject([e, server.name]);
        });
    });
  });
  return await Promise.all(promiseArray);
}
/**
 * @async
 * @description Sends an RCON command to all servers except the ones excluded
 * @param {string} command - Command to send to servers
 * @param {string[]} exclude - Servers to exclude, e.g. ["TEST", "CORE", "AWF-REG"]
 * @returns {Array<Array, string>} Returns an array of command outputs (arrays) and errors (strings), with the command outputs being same as rconCommand: either ["2 days, 28 minutes and 1 second", ""] or ["", "error: stuff"] if an error occurs. Example return is [["2 days, 28 minutes and 1 second", ""], "CORE"]
 * @see {@link rconCommand} to see how the RCON commands work
 * @example
 * // sends /time to all servers except dev server
 * // returns [[["2 days, 28 minutes and 1 second", ""], "CORE"], [["19 days, 5 minutes and 1 second", ""], "AWF-REG"]]
 * // the number of returns and return values depends on the number of servers and age of servers respectively, with the excluded server not being shown as returned
 * await rconCommandAllExclude("/time", ["TEST"])
 */
async function rconCommandAllExclude(command, exclude) {
  // exclude is an ARRAY of server names which to exclude
  if (!command.startsWith("/")) command = `/${command}`; //add a '/' if not present
  let serverNames = [];
  Object.keys(servers).forEach((s) => {
    if (!exclude.includes(servers[s].name)) serverNames.push(servers[s]);
  });
  let promiseArray = serverNames.map((server) => {
    return new Promise((resolve) => {
      rconCommand("/p o", server.name)
        .then((res) => {
          if (!res[1].startsWith("error")) {
            resolve([res, server.name]);
          } else {
            resolve([res, server.name]);
          }
        })
        .catch((e) => {
          reject([e, server.name]);
        });
    });
  });
  return await Promise.all(promiseArray);
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
  let res = await searchOneDB("otherData", "playerRoles", {
    factorioName: username,
  });
  if (res == null) {
    let push = {
      factorioName: username,
      roles: [roleName],
    };
    return await insertOneDB("otherData", "playerRoles", push);
  } else {
    let toPush = lodash.cloneDeep(res);
    if (!toPush.roles.includes(roleName)) {
      console.log("Adding role to DB!")
      toPush.roles.push(roleName);
      return await findOneAndReplaceDB("otherData", "playerRoles", res, toPush);
    }
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
  return await searchOneDB("otherData", "playerRoles", {
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
  let response = await rconCommand(
    `/interface local names = {} for i, role in ipairs(Roles.get_player_roles("${factorioName}")) do names[i] = role.name end return names`,
    serverName
  );
  if (response[1] == "error")
    return console.log(`Error contacting server ${serverName} using RCON`);
  if (response[0].includes("Unknown command"))
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
    rconCommand(`/assign-role ${factorioName} ${role}`, serverName);
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
  var res = await searchOneDB(server, "deaths", { player: `${player}` });
  if (res == null) {
    // if the player wasn't found in the server's database
    var writeObj = {
      player: `${player}`,
      deaths: {
        [reason]: 1,
      },
    };
    var out = await insertOneDB(server, "deaths", writeObj);
    if (out.result.ok !== 1) console.log("error adding to database");
    return;
  } else {
    var replaceWith = lodash.cloneDeep(res); // duplicate the object
    if (replaceWith.deaths[reason]) replaceWith.deaths[reason]++;
    else replaceWith.deaths[reason] = 1;
    var out = await findOneAndReplaceDB(server, "deaths", res, replaceWith);
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
  var res = await searchOneDB(server, "stats", {
    rocketLaunches: { $exists: true },
  });
  if (res == null) {
    // if the server wasn't found in the server's database
    var writeObj = {
      rocketLaunches: 1,
    };
    var out = await insertOneDB(server, "stats", writeObj);
    if (out.result.ok !== 1) console.log("error adding to database");
    return 1;
  } else {
    var replaceWith = await lodash.cloneDeep(res); // duplicate the object
    if (replaceWith.rocketLaunches) replaceWith.rocketLaunches++;
    else replaceWith.rocketLaunches = 1;
    var out = await findOneAndReplaceDB(server, "stats", res, replaceWith);
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
  var res = await searchOneDB(server, "stats", { research: "researchData" });
  if (level < 1) level = 1;
  if (res == null) {
    // if the server's research wasn't found in the server's database (first research)
    var writeObj = {
      research: "researchData",
      completedResearch: {
        [research]: level,
      },
    };
    var out = await insertOneDB(server, "stats", writeObj);
    if (out.result.ok !== 1) console.log("error adding to database");
    return;
  } else {
    var replaceWith = lodash.cloneDeep(res); // duplicate the object
    if (res.completedResearch[research] <= 1)
      replaceWith.completedResearch[research]++;
    else replaceWith.completedResearch[research] = level;
    var out = await findOneAndReplaceDB(server, "stats", res, replaceWith);
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
    let user = await searchOneDB("otherData", "linkedPlayers", {
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
    let user = await searchOneDB("otherData", "linkedPlayers", {
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
  // TODO: maybe change this to push the whole server objects, might be more useful. also create a dedicated one for filtered servers
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
 * @description Links a Factorio and Discord user, goes through the process of linking them. After linking, assigns the Member role to the player where the player issued the command to link themselves
 * @param {Object} discordClient - Discord client object
 * @param {string} factorioName - Factorio name of the user
 * @param {string} discordName - Discord name of the user
 * @param {Object} discordChannelID - Discord Channel ID, used to add roles
 */
async function linkFactorioDiscordUser(
  discordClient,
  factorioName,
  discordName,
  discordChannelID
) {
  //links the Factorio and Discord usernames, can be used for verification later
  //discordName is the name and tag of the user, e.g. SomeRandomPerson#0000
  let factorioServer = getServerFromChannelInput(discordChannelID);
  let server = await discordClient.guilds.cache.get("548410604679856151");
  let sendToUser = await server.members.fetch({ query: discordName, limit: 1 });
  sendToUser = sendToUser.first();
  let sentMsg = await sendToUser.send(
    `You have chosen to link your Discord account, \`${discordName}\` with your Factorio account on AwF, \`${factorioName}\`. The request will timeout after 5 minutes of sending. React with :hammer: to re-link your account. If complications arise, please contact devs/admins (relinking is when switching Factorio username, for switching Discord account contact admins/devs. Changing your Discord username **IS NOT** changing an account, whilst changing your Factorio username **is**)`
  );
  sentMsg.react("✅");
  sentMsg.react("🔨");
  sentMsg.react("❌");
  const filter = (reaction, user) => {
    return user.id === sendToUser.id;
  };
  // 5*60*1000 to get five minutes to milliseconds
  sentMsg
    .awaitReactions(filter, { max: 1, time: 5 * 60 * 1000, errors: ["time"] })
    .then(async (messageReaction) => {
      let reaction = messageReaction.first();
      if (reaction.emoji.name === "❌")
        return sendToUser.send("Linking cancelled");
      let dat = { factorioName: factorioName, discordID: sendToUser.id };
      let found = await searchOneDB("otherData", "linkedPlayers", {
        discordID: sendToUser.id,
      });
      if (found !== null && reaction.emoji.name === "🔨") {
        // re-link user
        let res = await findOneAndReplaceDB(
          "otherData",
          "linkedPlayers",
          found,
          dat
        );
        if (res.ok != 1)
          return sendToUser.send(
            "Please contact devs/admins for re-linking, process failed"
          );
        //redo statistics
        let prevStats = await searchOneDB("otherData", "globPlayerStats", {
          discordID: found.discordID,
        });
        let newStats = lodash.cloneDeep(prevStats);
        newStats.factorioName = factorioName;
        res = await findOneAndReplaceDB(
          "otherData",
          "globPlayerStats",
          prevStats,
          newStats
        );
        if (res.ok != 1)
          return sendToUser.send(
            "Please contact devs/admins for re-linking, process failed"
          );
        sendToUser.send("Re-linked succesfully!");
        givePlayerRoles(factorioName, "Member", factorioServer.name); // give the Member role to new players
      } else if (found !== null && reaction.emoji.name === "❌")
        // cancel, found a user and they
        return sendToUser.send("Already linked");
      else if (found === null && reaction.emoji.name === "✅") {
        let res = await insertOneDB("otherData", "linkedPlayers", dat);
        if (res.result.ok == 0)
          sendToUser.send("Failed linking. Contact devs/admins");
        else sendToUser.send("Linked successfully");
        givePlayerRoles(factorioName, "Member", factorioServer.name); // give the Member role to new players
      }
    })
    .catch((out) => {
      if (out.size == 0)
        return sendToUser.send(`Didn't react in time. Please try again.`);
      else return sendToUser.send("Error. Please contact admin/dev");
    });
}
/**
 * @async
 * @description Changes the amount of points the player has in the database
 * @param {Object} user - Object of the user, same as linked user: {discordID: "discord id", factorioName: "factorio name"}
 * @param {Number} built - Number of entities built to add to statistics
 * @param {Number} time - Number of minutes the user has played
 * @param {Number} death - number of deaths
 * @see {@link searchOneDB} to see how searching database is done
 * @see {@link findOneAndReplaceDB} to how replacing in database is done
 * @returns {Array<Object>} an array of the object the data was replaced with, object of the user inputted
 * @example
 * // ex1: oof2win2 built 68 entities and played 93 minutes
 * changePoints({factorioName: "oofw2win2", discordID: "69420"}, 68, 93, 0)
 * // ex2: oof2win2 died once
 * changePoints({factorioName: "oofw2win2", discordID: "69420"}, 0, 0, 1)
 */
async function changePoints(user, built, time, death = 0) {
  var res = await searchOneDB("otherData", "globPlayerStats", {
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
  await findOneAndReplaceDB("otherData", "globPlayerStats", res, replaceWith);
  return [replaceWith, user];
}

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
    linkFactorioDiscordUser(
      discordClient,
      logObject.playerName,
      logObject.discordName,
      discordChannelID
    );
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
    let find = await searchOneDB("otherData", collectionName, {
      playername: playerName,
    });
    let send;
    if (find == null) send = "";
    else send = JSON.stringify(find.data);
    rconCommand(
      `/interface Datastore.ingest('request', '${collectionName}', '${playerName}', '${send}')`,
      factorioServer.name
    );
  } else if (requestType == "message") {
    // send to all servers without saving
    rconCommandAll(
      // args is now the rest of the stuff
      `/interface Datastore.ingest('message', '${collectionName}', '${playerName}', '${args}')`
    );
  } else if (requestType == "propagate") {
    // send to all servers except the server the request is coming from and send to database
    rconCommandAllExclude(
      // args is now the rest of the stuff
      `/interface Datastore.ingest('propagate', '${collectionName}', '${playerName}', '${args}')`,
      [`${serverObject.name}`]
    );
    let find = await searchOneDB("otherData", collectionName, {
      playername: playerName,
    });
    if (find == null) {
      let send = {
        playername: playerName,
        data: JSON.parse(args),
      };
      insertOneDB("otherData", collectionName, send);
    } else {
      let send = lodash.cloneDeep(find);
      send.data = JSON.parse(args);

      findOneAndReplaceDB("otherData", collectionName, find, send);
    }
  } else if (requestType == "save") {
    // save to database
    let find = await searchOneDB("otherData", collectionName, {
      playername: playerName,
    });
    if (find == null) {
      let send = {
        playername: playerName,
        data: JSON.parse(line),
      };
      insertOneDB("otherData", collectionName, send);
    } else {
      let send = lodash.cloneDeep(find);
      send.data = JSON.parse(line);
      findOneAndReplaceDB("otherData", collectionName, find, send);
    }
  } else if (requestType == "remove") {
    // remove from database
    let toDelete = {
      playername: playerName,
      data: JSON.parse(args),
    };
    deleteOneDB("otherData", collectionName, toDelete);
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
  if (froles == null) return;
  else {
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