/**
 * @file File for functions that didn't deserve their own helper file. Generally small functions
 */

const nodemailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');
const { emailUser, emailPass } = require('../config')
const serversJS = require("../servers")
const childprocess = require("child_process")
const discord = require("discord.js")
const fs = require("fs")

module.exports = {
  getPrefix,
  supportLink,
  sortByKey,
  shuffle,
  randomNum,
  convertTime,
  getLevel,
  getCommunitiveXp,
  getLevelXp, 
  sendEmail,
  bubbleSort,
  getServerFromChannelInput,
  runShellCommand,
  sortModifiedDate,
	getConfirmationMessage,
	createPagedEmbed,
}
function getPrefix(message, data) {
  if (message.channel.type !== 'dm') {
    const prefixes = [
      `<@!${message.client.user.id}> `,
      `<@${message.client.user.id}> `,
      message.client.user.username.toLowerCase(),
      data.guild.prefix
    ];
    let prefix = null;
    prefixes.forEach(p => {
      if (message.content.startsWith(p) || message.content.toLowerCase().startsWith(p)) {
        prefix = p;
      };
    });
    return prefix;
  } else {
    return true;
  }
}
async function supportLink(client) {
  const guild = client.guilds.cache.get(client.config.support.id);
  const member = guild.me;
  const channel = guild.channels.cache.find((ch) => ch.permissionsFor(member.id).has('CREATE_INSTANT_INVITE'));
  if (channel) {
    const invite = await channel.createInvite({ maxAge: 0 }).catch(() => { });
    return invite ? invite.url : null;
  } else {
    return 'https://dbyte.xyz';
  }
}
function sortByKey(array, key) {
  return array.sort(function (a, b) {
    const x = a[key];
    const y = b[key];
    return ((x < y) ? 1 : ((x > y) ? -1 : 0));
  });
}
function shuffle(pArray) {
  const array = [];
  pArray.forEach(element => array.push(element));
  let currentIndex = array.length, temporaryValue, randomIndex;
  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
  return array;
}
function randomNum(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}
function convertTime(guild, time) {
  const absoluteSeconds = Math.floor((time / 1000) % 60);
  const absoluteMinutes = Math.floor((time / (1000 * 60)) % 60);
  const absoluteHours = Math.floor((time / (1000 * 60 * 60)) % 24);
  const absoluteDays = Math.floor(time / (1000 * 60 * 60 * 24));

  const d = absoluteDays
    ? absoluteDays === 1
      ? '1 day'
      : `${absoluteDays} days`
    : null;
  const h = absoluteHours
    ? absoluteHours === 1
      ? '1 hour'
      : `${absoluteHours} hours`
    : null;
  const m = absoluteMinutes
    ? absoluteMinutes === 1
      ? '1 minute'
      : `${absoluteMinutes} minutes`
    : null;
  const s = absoluteSeconds
    ? absoluteSeconds === 1
      ? '1 second'
      : `${absoluteSeconds} seconds`
    : null;

  const absoluteTime = [];
  if (d) absoluteTime.push(d);
  if (h) absoluteTime.push(h);
  if (m) absoluteTime.push(m);
  if (s) absoluteTime.push(s);

  return absoluteTime.join(', ');
}
function getLevel(xp) {
  return level = Math.floor((((3888 * xp ** 2 + 291600 * xp - 207025) ** (0.5) / (40 * 3 ** (3 / 2)) + ((3 * (3 * xp)) / 5 + 2457 / 4) / 6 - 729 / 8) ** (1 / 3) + 61 / (12 * ((3888 * xp ** 2 + 291600 * xp - 207025) ** (0.5) / (40 * 3 ** (3 / 2)) + ((3 * (3 * xp)) / 5 + 2457 / 4) / 6 - 729 / 8) ** (1 / 3)) - 9 / 2))
}
function getCommunitiveXp(lvl) {
  return communitive = Math.floor(((5 * lvl * lvl * lvl) / 3) + ((45 * lvl * lvl) / 2) + ((455 * lvl) / 6))
}
function getLevelXp(lvl) {
  return levelXp = 5 * Math.floor(lvl / 1) ** 2 + 50 * Math.floor(lvl / 1) + 100
}
function sendEmail (emailAddress, contents, callback) {
  let transporter = nodemailer.createTransport(smtpTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    auth: {
      user: `${emailUser}`,
      pass: `${emailPass}`
    }
  }));

  const mailOptions = {
    from: "comfybotemail@gmail.com",
    to: `${emailAddress}`,
    subject: "Verification Code",
    text: `${contents}`
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
      callback(error)
    } else {
      console.log('Email sent: ' + info.response);
      callback(info)
    }
  })
}

/**
 * Sorts an array with BubbleSort. Tested with strings and numbers.
 * @param {Array} arr - Unsorted array
 * @returns {Array} Sorted array
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
 * 
 * @param {discord.Snowflake} channelID - ID of the Discord channel that you are trying to get
 * @returns {(object|null)} A server object from the servers.js file
 */
function getServerFromChannelInput(channelID) {
  let serverKeys = Object.keys(serversJS);
  for (let i = 0; i < serverKeys.length; i++) {
    if (serversJS[serverKeys[i]].discordid == channelID) {
      return serversJS[serverKeys[i]];
    }
  }
  return null;
}
/**
 * Run a shell command. Returns only after the command is finished. DOesn't allow for extra specifications
 * @param {string} cmd - Shell command to run
 * @returns {(childprocess.stdout|childprocess.stderr)}
 */
async function runShellCommand(cmd) {
  return new Promise((resolve, reject) => {
    childprocess.exec(cmd, function (error, stdout, stderr) {
      if (stdout) resolve(stdout);
      if (stderr) reject(stderr);
      if (error) reject(error);
    });
  });
}
/**
 * Sort a directory's contents by date modified
 * @param {string[]} pathArr - Path to the directory you want to get files from and sort by modified date
 * @returns {Object[]} Array of path objects, sorted by last modified. has path and mtime (modified time)
 */
function sortModifiedDate(pathArr) {
  let files = pathArr.map((path) => {
    return {
      path: path,
      mtime: fs.statSync(path).mtime.getTime()
    }
  })
  return files.sort((a, b) => b.mtime - a.mtime)
}

async function getConfirmationMessage(message, content) {
	const confirm = await message.channel.send(content)
	confirm.react("✅")
	confirm.react("❌")
	const reactionFilter = (reaction, user) => user.id === message.author.id
	let reactions
	try {
		reactions = await confirm.awaitReactions(reactionFilter, { max: 1, time: 120000, errors: ["time"] })
	} catch (error) {
		return false
	}
	const reaction = reactions.first()
	if (reaction.emoji.name === "❌") return false
	return true
}

/**
 * 
 * @param {Array} fields 
 * @param {object} embedMsgOptions - Standard
 * @param {object} options
 * @param {options.maxPageCount} maxPageCount - maximum number of things on the page
 */
async function createPagedEmbed(fields, embedMsgOptions, message, options = {}) {
	if (!options.maxPageCount) options.maxPageCount = 25
	let embed = new MessageEmbed(embedMsgOptions)
	let page = 0
	const maxPages = Math.floor(fields.length / options.maxPageCount)
	embed.fields = fields.slice(0, options.maxPageCount)
	let embedMsg = await message.channel.send(embed)

	const setData = async () => {
		const start = page * options.maxPageCount
		embed.fields = fields.slice(start, start + options.maxPageCount)
		embedMsg = await embedMsg.edit(null, embed)
	}
	const removeReaction = async (emoteName) => {
		embedMsg.reactions.cache.find(r => r.emoji.name === emoteName).users.remove(message.author.id)
	}

	embedMsg.react("⬅️")
	embedMsg.react("➡️")
	embedMsg.react("🗑️")


	const backwardsFilter = (reaction, user) => reaction.emoji.name === "⬅️" && user.id === message.author.id
	const forwardsFilter = (reaction, user) => reaction.emoji.name === "➡️" && user.id === message.author.id
	const removeFilter = (reaction, user) => reaction.emoji.name === "🗑️" && user.id === message.author.id

	const backwards = embedMsg.createReactionCollector(backwardsFilter, { timer: 120000 })
	const forwards = embedMsg.createReactionCollector(forwardsFilter, { timer: 120000 })
	const remove = embedMsg.createReactionCollector(removeFilter, { timer: 120000 })

	backwards.on("collect", (reaction) => {
		page--
		removeReaction("⬅️") // remove the user's reaction no matter what
		if (page == -1) page = 0
		else setData()
	})
	forwards.on("collect", (reaction) => {
		page++
		removeReaction("➡️") // remove the user's reaction no matter what
		if (page > maxPages) page = maxPages
		else setData()
	})

	remove.on("collect", () => {
		embedMsg.delete()
	})
}
