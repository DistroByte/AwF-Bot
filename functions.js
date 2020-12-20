const FIFO = require("fifo-js");
const fs = require("fs");
const MongoClient = require("mongodb").MongoClient;
const lodash = require("lodash");
const servers = require("./servers.json"); // tails, fifo, discord IDs etc.
const { exec } = require("child_process");
const { uri, rconport, rconpw } = require("./botconfig.json");
const Rcon = require("rcon-client");
const { MessageEmbed } = require("discord.js");
const { request } = require("http");

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
  formatVersion: function (data) {
    data.trim();
    return data.slice(data.indexOf("Factorio"), data.indexOf("(b")).trim();
  },
  formatDate: function (data) {
    data.trim();
    return data.slice(data.indexOf("0.000") + 6, 25);
  },
  formatSaveData: function (data) {
    return data.slice(data.indexOf("_autosave") + 1, data.indexOf("(") - 1);
  },
  sendToAll: function (message, sendWithUsername) {
    // The $message given to this function is an object of discord.js - it has the author username, message content, mentions etc.
    // The $sendWithUsername given to the function is a boolean value (fixed from being a 0 or 1). If sendWithUsername is true, it will send the message with the username
    // sends a message to all servers at once
    serverFifos.forEach((fifo) => {
      if (sendWithUsername) {
        fifo[0].write(
          `${message.author.username}: ${message.content}`,
          () => {}
        );
      } else {
        fifo[0].write(`${message.content}`, () => {});
      }
    });
  },
  sendToServer: function (message, sendWithUsername) {
    // The $message given to this function is an object of discord.js - it has the author username, message content, mentions etc.
    // The $sendWithUsername given to the function is a boolean value (fixed from being a 0 or 1). If sendWithUsername is true, it will send the message with the username
    // sends a message to only one server with or without the username

    serverFifos.forEach((factorioServer) => {
      if (message.channel.id === factorioServer[1].discordChannelID) {
        if (sendWithUsername) {
          factorioServer[0].write(
            `${message.author.username}: ${message.content}`,
            () => {}
          );
        } else {
          factorioServer[0].write(`${message.content}`, () => {});
        }
      }
    });
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
  },
  getServerFromChannelInput,
  formatChatData,
  searchOneDB,
  insertOneDB,
  findOneAndReplaceDB,
  deleteOneDB,
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
};

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
function getServerFromChannelInput(channelID) {
  // gets a server object from channel ID
  let serverKeys = Object.keys(servers);
  for (let i = 0; i < serverKeys.length; i++) {
    if (servers[serverKeys[i]].discordChannelID == channelID) {
      return servers[serverKeys[i]];
    }
  }
}
async function searchOneDB(dat, coll, toSearch) {
  await dBclientConnectionPromise; //just wait so the database is connected
  // Returns an object of the thing found or null if not found
  const collection = client.db(dat).collection(coll);
  return collection.findOne(toSearch);
}
async function insertOneDB(dat, coll, toInsert) {
  await dBclientConnectionPromise; //just wait so the database is connected
  // To check if written in correctly, use: ret.result.ok (1 if correctly, 0 if written falsely)
  const collection = client.db(dat).collection(coll);
  return collection.insertOne(toInsert);
}
async function findOneAndReplaceDB(dat, coll, toFind, toReplace) {
  await dBclientConnectionPromise; //just wait so the database is connected
  // To check if written in correctly, use: ret.result.ok (1 if correctly, 0 if written falsely)
  const collection = client.db(dat).collection(coll);
  return collection.findOneAndReplace(toFind, toReplace);
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
async function rconCommandAll(command) {
  if (!command.startsWith("/")) command = `/${command}`; //add a '/' if not present
  let serverNames = [];
  Object.keys(servers).forEach((s) => {
    serverNames.push(servers[s]);
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
    toPush.roles.push(roleName);
    return await findOneAndReplaceDB("otherData", "playerRoles", res, toPush);
  }
}
async function getFactorioRoles(factorioName) {
  return await searchOneDB("otherData", "playerRoles", {
    factorioName: factorioName,
  });
}
async function givePlayerRoles(factorioName, role, serverName) {
  // This function itself
  // roles is a name of a role
  // this function itself doesnt touch the database
  let response = await rconCommand(
    `/interface local names = {} for i, role in ipairs(Roles.get_player_roles("${factorioName}")) do names[i] = role.name end return names`,
    serverName
  );
  if (response[1] == "error")
    return console.log(`Error contacting server ${serverName} using RCON`);
  response = response[0].slice(0, response[0].indexOf("\n"));
  response = response.slice(
    response.indexOf("{") + 2,
    response.indexOf("}") - 1
  );
  response = response.replace(/"/g, "");
  currentRoles = response.split(",  ");
  if (!currentRoles.includes(role)) {
    rconCommand(`/assign-role ${factorioName} ${role}`, serverName);
    giveFactorioRole(factorioName, role);
  }
}
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
  return 0;
}
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
async function addResearch(server, research, level) {
  var res = await searchOneDB(server, "stats", { research: "researchData" });
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
    if (resp[0].time > 60 * 10) {
      // give Veteran role if player has more than 10h played across all servers
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
function getServerList() {
  let serverNames = [];
  Object.keys(servers).forEach((element) => {
    if (servers[element].serverFolderName !== "")
      serverNames.push(servers[element].serverFolderName);
  });
  return serverNames;
}
async function runShellCommand(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, function (error, stdout, stderr) {
      if (stdout) resolve(stdout);
      if (stderr) reject(stderr);
      if (error) reject(error);
    });
  });
}
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
async function changePoints(user, built, time, death = 0) {
  var res = await searchOneDB("otherData", "globPlayerStats", {
    discordID: user.discordID,
  });
  if (res == null) {
    pushData = {
      discordID: user.discordID,
      timePlayed: 0,
      time: 0, // points for time played
      built: 0,
      deaths: 0,
      points: 0,
    };
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
      replaceWith.points -= 100 * death; //-100pts for death
    }
    if (replaceWith.points == null) replaceWith.points = 0;
    replaceWith.points += built;
    replaceWith.points += (time / 60) * 50; //50 pts/h
    await findOneAndReplaceDB("otherData", "globPlayerStats", res, replaceWith);
    return [replaceWith, user];
  }
}
async function awfLogging(
  line,
  discordChannelID,
  discordClient,
  discordChannelName
) {
  let logObject = JSON.parse(line);
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
async function discordLog(
  line,
  discordChannelID,
  discordClient,
  discordChannelName
) {
  let objLine = JSON.parse(line);
  objLine.fields[0].value = objLine.fields[0].value.replace(
    "${serverName}",
    discordClient.channels.cache.get(discordChannelID)
  );
  let embed = new MessageEmbed(objLine);
  discordClient.channels.cache.get("697146357819113553").send(embed); // moderators channel
}
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
async function onJoin(playerName, discordChannel, discordClient) {
  const froles = await getFactorioRoles(playerName);
  const joinedServer = getServerFromChannelInput(discordChannel);
  if (froles == null) return;
  else {
    froles.roles.forEach((role) => {
      givePlayerRoles(playerName, role, joinedServer.name);
    });
  }
}
