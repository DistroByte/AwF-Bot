/**
 * @file Listens to all server events and works with them. Adds messages to client's queue to send them in batches
 */

const Tails = require("../base/Tails")
const mongoose = require("mongoose")
const ServerStatistics = require("../base/Serverstatistics")
const rcon = require("../helpers/rcon")
const lodash = require("lodash")
const { MessageEmbed } = require("discord.js")
const Users = require("../base/User")
const { Util } = require("discord.js")
const config = require("../config")
const { checkBan } = require("./functions")

class serverHandler {
	constructor(client) {
		this.client = client
		this.helpdesk = "723280139982471247" // helpdesk channel

		Tails.on("CHAT", (log) => this.chatHandler(log))
		Tails.on("out", (log) => this.outHandler(log))
		Tails.on("playerJoin", (log) => this.playerStuff(log))
		Tails.on("playerLeave", (log) => this.playerStuff(log))
		Tails.on("JLOGGER", (log) => this.jloggerHandler(log))
		Tails.on("logging", (log) => this.awfLogging(log))
		Tails.on("datastore", (log) => this.datastoreHandler(log))
		Tails.on("discord", (log) => this.discordHandler(log))
		// Tails.on("ALL", (log) => this.allHandler(log))
		Tails.on("start", (log) => this.startHandler(log))
	}
	_formatDate(line) {
		return line.trim().slice(line.indexOf("0.000") + 6, 25);
	}
	_formatVersion(line) {
		return line.slice(line.indexOf("Factorio"), line.indexOf("(build")).trim();
	}
	_formatChatData(data) {
		data = data.slice(data.indexOf("]") + 2); //removing the [CHAT] from sending to Discord
		if (data.includes("[")) {
			if (data.replace(/(.*:)\s*\[.*=.*\]\s*/g, "") == "") {
				return ""; // if it is only the [] and whitespaces, nothing else
			}
			// These all are for Factorio rich text magic, in order of https://wiki.factorio.com/Rich_text
			// for now, the discord will show [image], [item], [gps] but that can be removed completely by just
			// replacing the second phrase in the .replace with an empty string, i.e. ''
			if (data.includes("[img="))
				data = data.replace(/\[img=.*\]/g, "[image]");
			if (data.includes("[item="))
				data = data.replace(/\[item=.*\]/g, "[item]");
			if (data.includes("[entity="))
				data = data.replace(/\[entity=.*\]/g, "[entity]");
			if (data.includes("[technology="))
				data = data.replace(/\[technology=.*\]/g, "[research]");
			if (data.includes("[recipe="))
				data = data.replace(/\[recipe=.*\]/g, "[recipe]");
			if (data.includes("[item-group="))
				data = data.replace(/\[item-group=.*\]/g, "[item group]");
			if (data.includes("[fluid="))
				data = data.replace(/\[fluid=.*\]/g, "[fluid]");
			if (data.includes("[tile="))
				data = data.replace(/\[tile=.*\]/g, "[tile]");
			if (data.includes("[virtual-signal="))
				data = data.replace(/\[virutal-signal=.*\]/g, "[signal]");
			if (data.includes("[achievement="))
				data = data.replace(/\[achievement=.*\]/g, "[achievement]");
			if (data.includes("[gps="))
				data = data.replace(/\[gps=.*\]/g, "[gps]");
			if (data.includes("[special-item="))
				data = data.replace(/\[special-item=.*\]/g, "[bp/upgrade/decon]");
			if (data.includes("[armor="))
				data = data.replace(/\[armor=.*\]/g, "[armor]");
			if (data.includes("[train="))
				data = data.replace(/\[train=.*\]/g, "[train]");
			if (data.includes("[train-stop="))
				data = data.replace(/\[train-stop.*\]/g, "[train stop]");
		}
		return data;
	}
	_appendMessage(fromServer, msg) {
		this.client.serverQueues.forEach((srv) => {
			if (srv.server.discordid === fromServer.discordid) {
				srv.messageQueue.push(msg)
			}
		})
	}
	async _assignRoles(playername, server) {
		let user = await this.client.findUserFactorioName(playername)
		if (!user || !user.factorioRoles) return
		let res = (await rcon.rconCommand(`/interface local names = {} for i, role in ipairs(Roles.get_player_roles("${playername}")) do names[i] = role.name end return names`, server.discordid)).resp
		if (!res.length)
			return console.error(res)
		const roles = res.slice(res.indexOf("{") + 2, res.indexOf("}") - 1).replace(/"/g, "").split(",  ")
		user.factorioRoles.forEach((role) => {
			if (!roles.includes(role))
				rcon.rconCommand(`/interface Roles.assign_player("${playername}", "${role}", "${this.client.user.username}")`, server.discordid).catch(console.error)
		})
	}
	async chatHandler(chat) {
		let line = chat.line
		const server = chat.server
		if (line.includes("?griefer"))
			this.client.channels.fetch(this.helpdesk).then((channel) => channel.send(`Griefer in <#${server.discordid}>!`))
		line = this._formatChatData(line)
		if (line == "") return
		line = Util.escapeMarkdown(line)
		line = line.replace(/@/g, "@\u200b")
		this._appendMessage(server, `:speech_balloon: ${line}`)
	}
	async outHandler(out) {
		let line = out.line
		const server = out.server
		let channel = this.client.channels.cache.get(server.discordid)
		if (line.includes("; Factorio")) {
			return channel.setTopic(`Running ${this._formatVersion(line)} since ${this._formatDate(line)}`)
		}
		if (line.includes("Error")) {
			if (channel.name !== "dev-dump")
				client.channels.cache
					.get("786603909489491988")
					.send(`Error in ${channel.name}: ${line}`);
		}
		if (line.includes("Saving game as")) // normal save
			return this._appendMessage(server, `${this.client.emotes?.serversave} \`${line.slice(line.lastIndexOf("/") + 1)}\``)
		if (line.includes("Saving to ")) // autosave
			return this._appendMessage(server, `${this.client.emotes?.serversave} \`${line.slice(line.lastIndexOf(" _") + 1, line.lastIndexOf("(blocking") - 1)}\``)
	}
	async playerStuff(data) {
		const line = data.line
		const server = data.server
		if (line.type === "join") {
			this._appendMessage(server, `${this.client.emotes?.playerjoin} ${line.playerName} has joined the game`)
			this._assignRoles(line.playerName, server).then(() => { })

      // check if player is banned
      const banned = await checkBan(line.playerName)
      if (banned) rcon.rconCommandAll(`/ban ${line.playerName} Please defer your ban on http://awf.yt`)
		}
		if (line.type === "leave") {
			switch (line.reason) {
				case "quit":
					this._appendMessage(server, `${this.client.emotes?.playerleave} ${line.playerName} has left the game`)
					break;
				case "dropped":
					this._appendMessage(server, `${this.client.emotes?.playerleave} ${line.playerName} was dropped from the game`)
					break;
				case "reconnect":
					this._appendMessage(server, `${this.client.emotes?.playerleave} ${line.playerName} has left to reconnected to the game`)
					break;
				case "wrong_input":
					this._appendMessage(server, `${this.client.emotes?.playerleave} ${line.playerName} has left due to wrong input`)
					break;
				case "desync_limit_reached":
					this._appendMessage(server, `${this.client.emotes?.playerleave} ${line.playerName} has desynced`)
					break;
				case "cannot_keep_up":
					this._appendMessage(server, `${this.client.emotes?.playerleave} ${line.playerName} could not keep up with the game`)
					break;
				case "afk":
					this._appendMessage(server, `${this.client.emotes?.playerleave} ${line.playerName} is AFK or asleep`)
					break;
				case "kicked":
					this._appendMessage(server, `${this.client.emotes?.playerleave} ${line.playerName} was yeeted`)
					break;
				case "kicked_and_deleted":
					this._appendMessage(server, `${this.client.emotes?.playerleave} ${line.playerName} was vaporized`)
					break;
				case "banned":
					this._appendMessage(server, `${this.client.emotes?.playerleave} ${line.playerName} heard the banhammer speak`)
					break;
				case "switching_servers":
					this._appendMessage(server, `${this.client.emotes?.playerleave} ${line.playerName} is switching servers`)
					break;
				default:
					this._appendMessage(server, `${this.client.emotes?.playerleave} ${line.playerName} quit due to reason ${line.reason}`)
			}
		}
	}
	async jloggerHandler(data) {
		let line = data.line
		const server = data.server
		let channel = this.client.channels.cache.get(server.discordid)
		if (line.includes("RESEARCH FINISHED:")) {
			const research = line.slice(line.indexOf("RES") + ("RESEARCH FINISHED:").length).trim().split(" ")[0]
			const level = line.slice(line.indexOf("RES") + ("RESEARCH FINISHED:").length).trim().split(" ")[1]
			if (research === "logistic-robotics")
				this._appendMessage(server, `${this.client.emotes?.logibots} Is it a bird? Is it a plane...?`)
			else 
				this._appendMessage(server, `${this.client.emotes?.sciencepack} ${research} at level ${level} has been researched!`)
			ServerStatistics.findOneAndUpdate({ serverID: server.discordid }, {
				$push: { completedResearch: { name: research, level: level } }
			}).exec()
		}
		if (line.includes("DIED")) {
			line = line.slice("DIED: ".length);
			line = line.split(" "); //split at separation between username and death reson
			if (line[0].includes("PLAYER: ")) {
				line[0] = line[0].slice("PLAYER: ".length);
				line[1] = `Player ${line[1]}`;
			}
			if (line[0] == "PLAYER:") line.shift();
			this._appendMessage(server, `${this.client.emotes?.playerdeath} ${line[0]} died due to ${line[1]}`);

			let user = await this.client.findUserFactorioName(line[0])
			user.factorioStats.deaths++
			user.factorioStats.points -= 100
			user.save().then(() => { })
		}
		if (line.includes("ROCKET: ")) {
			let serverStats = await ServerStatistics.findOneAndUpdate({ serverID: server.discordid }, {
				$inc: { rocketLaunches: 1 }
			}, { new: true })
			if (!serverStats)
				serverStats = await ServerStatistics.create({
					serverName: server.name,
					serverID: server.discordid,
					rocketLaunches: 1,
					completedResearch: []
				})
			if (serverStats.rocketLaunches === 1)
				return this._appendMessage(server, `:rocket: Hooray! This server's first rocket has been sent!`)
			let rockets = 10
			for (let i = 0; i < 50; i++) {
				if (serverStats.rocketLaunches === rockets) {
					return this._appendMessage(server, `:rocket: Hooray! This server has sent ${rockets} rockets!`)
				}
				rockets *= 2
			}
		}
		if (line.includes("EVOLUTION: ")) {
			let evolution = parseFloat(line.slice(line.indexOf("EVOLUTION: ") + ("EVOLUTION: ").length))
			let serverstats = await ServerStatistics.findOne({ serverID: server.discordid })
			if (evolution.toFixed(2) == 0.33 && !serverstats.evolution.big) {
				this._appendMessage(server, `${this.client.emotes?.bigspitter} Evolution is now 0.33!`)
				ServerStatistics.findOneAndUpdate({ serverID: server.discordid }, {
					$set: { "evolution.big": true }
				}).then(() => { })
			}
			if (evolution.toFixed(2) == 0.66 && !serverstats.evolution.behemoth) {
				this._appendMessage(server, `${this.client.emotes?.behemothspitter} Evolution is now 0.66! Green boys inc!`)
				ServerStatistics.findOneAndUpdate({ serverID: server.discordid }, {
					$set: { "evolution.behemoth": true }
				}).then(() => { })
			}
		}
		if (line.includes("STATS: ")) {
			let tmp = line.slice(line.indexOf("STATS: ") + "STATS: ".length).split(" ")
			let playername = tmp.shift()
			let builtEntities = parseInt(tmp.shift())
			let playTime = parseInt(tmp.shift())
			let user = await this.client.findUserFactorioName(playername)
			if (!user) return // don't run on people who don't have stuff
			const addHoursPlayed = (parseInt(playTime) / 54000) / 4 // 54000 ticks in 15 mins, 15*60*60, 60 minutes in an hour
			const totHoursPlayed = ((parseInt(playTime) + user.factorioStats.timePlayed) / 54000) / 4
			user.factorioStats.builtEntities += builtEntities
			user.factorioStats.timePlayed += playTime
			user.factorioStats.points += builtEntities
			user.factorioStats.points += addHoursPlayed * 50
			if (totHoursPlayed > this.client.consts.veteranUserHours) {
				if (!user.factorioRoles.includes(this.client.config.factorioRoles.veteran.name)) {
					this.client.guilds.fetch(this.client.consts.guildid).then((guild) => {
						guild.members.fetch(user.id).then((guildmember) => {
							guildmember.roles.add(this.client.config.factorioRoles.veteran.id).then(() => { }) // add Veteran role on Discord
						})
					})
					user.factorioRoles.push(this.client.config.factorioRoles.veteran.name) // add role to DB
					user.save().then(() => this._assignRoles(playername, server).then(() => { })) // assign roles in-game
				}
			}
			else user.save().then(() => { }) // normal save
		}
	}
	async awfLogging(data) {
		let line = JSON.parse(data.line)
		if (line.type === 'link') {
			this.client.cache.linkingCache.set(`${line.linkID}`, `${line.playerName}`)
		}
	}
	async datastoreHandler(data) {
		let request = data.line.split(' ')
		const requestType = request.shift()
		const collectionName = request.shift()
		const playerName = request.shift()
		let line = data.line.slice(
			// +3 for spaces
			requestType.length + collectionName.length + playerName.length + 3
		);
		if (requestType == "request") {
			// request from database and send back to server
			let find = await mongoose.connections[1].client.db("scenario").collection(collectionName).findOne({
				playername: playerName,
			})
			let send;
			(find) ? send = JSON.stringify(find.data) : send = ""
			rcon.rconCommand(
				`/interface Datastore.ingest('request', '${collectionName}', '${playerName}', '${send}')`,
				data.server.discordid
			);
		} else if (requestType == "message") {
			// send to all servers without saving
			rcon.rconCommandAll(
				// args is now the rest of the stuff
				`/interface Datastore.ingest('message', '${collectionName}', '${playerName}', '${args}')`
			);
		} else if (requestType == "propagate") {
			// send to all servers except the server the request is coming from and send to database
			rcon.rconCommandAllExclude(
				// args is now the rest of the stuff
				`/interface Datastore.ingest('propagate', '${collectionName}', '${playerName}', '${args}')`,
				[`${serverObject.name}`]
			);
			let find = await mongoose.connections[1].client.db("scenario").collection(collectionName).findOne({
				playername: playerName,
			});
			if (find == null) {
				let send = {
					playername: playerName,
					data: JSON.parse(args),
				};
				await mongoose.connections[1].client.db("scenario").collection(collectionName).insertOne(send);
			} else {
				let send = lodash.cloneDeep(find);
				send.data = JSON.parse(args);

				await mongoose.connections[1].client.db("scenario").collection(collectionName).findOneAndReplace(find, send);
			}
		} else if (requestType == "save") {
			// save to database
			let find = await mongoose.connections[1].client.db("scenario").collection(collectionName).findOne({
				playername: playerName,
			})
			if (find == null) {
				let send = {
					playername: playerName,
					data: JSON.parse(line),
				};
				await mongoose.connections[1].client.db("scenario").collection(collectionName).insertOne(send)
			} else {
				let send = lodash.cloneDeep(find);
				send.data = JSON.parse(line);
				await mongoose.connections[1].client.db("scenario").collection(collectionName).findOneAndReplace(find, send);
			}
		} else if (requestType == "remove") {
			// remove from database
			let toDelete = {
				playername: playerName,
				data: JSON.parse(args),
			};
			await mongoose.connections[1].client.db("scenario").collection(collectionName).deleteOne(toDelete);
		}
	}
	async discordHandler(data) {
		if (data.server.dev) return // ignore dev server
		const message = data.line.replace("${serverName}", `<#${data.server.discordid}>`)
		const embed = JSON.parse(message)
		this.client.channels.cache.get(data.server.discordid)?.send({
      embed: (new MessageEmbed(embed)),
      message: `<@&${config.moderatorroleid}>`
    })
		this.client.channels.cache.get(this.client.config.moderatorchannel)?.send({
      embed: (new MessageEmbed(embed)),
      message: `<@&${config.moderatorroleid}>`
    })
	}
	async startHandler(data) {
		let server = data.server
		if (server.roleSync) {
			setTimeout(async () => {
				let roles = await Users.find({}).select({ 'factorioName': 1, 'factorioRoles': 1 }).exec()
				let toSend = {}
				roles.forEach((player) => {
					if (!player.factorioName) return
					else toSend[player.factorioName] = player.factorioRoles
				})
				const res = await rcon.rconCommand(`/interface Roles.override_player_roles(game.json_to_table('${JSON.stringify(toSend)}'))`, server.discordid).then((output) => output.resp)
				if (res.trim() == "Command Complete") this.client.channels.cache.get(data.server.discordid).send("Roles have synced")
			}, 5000) // allow server to connect to rcon
		}
		const stats = await ServerStatistics.findOne({ serverID: server.discordid})
		if (!stats) {
			await ServerStatistics.create({
				serverID: server.discordid,
				serverName: server.discordName
			})
		}
	}
}
module.exports = serverHandler
