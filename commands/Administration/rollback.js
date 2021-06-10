const { MessageEmbed } = require("discord.js")
const Command = require("../../base/Command.js");
const { sortModifiedDate, runShellCommand, getConfirmationMessage, createPagedEmbed } = require("../../helpers/functions")
const fs = require("fs");
const servers = require("../../servers")

class Rollback extends Command {
	constructor(client) {
		super(client, {
			name: "rollback",
			description: "Restore a Factorio save",
			usage: "(channel) (save name)",
			aliases: ["restoresave"],
			examples: ["{{p}}rollback #awf-regular _autosave43"],
			dirname: __dirname,
			enabled: true,
			guildOnly: false,
			aliases: [],
			memberPermissions: ["ADMINISTRATOR"],
			botPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
			nsfw: false,
			ownerOnly: false,
			cooldown: 5000,
			customPermissions: ["MANAGE_SERVER"],
		});
	}

	async run(message, args) {
		const serverid = message.mentions.channels.first()?.id || await this.client.channels.fetch(args[0]).then(c => c?.id)
		const server = servers.find(server => server.discordid === serverid)
		if (!server) return message.channel.send(`\`${args[0]}\` is an invalid server!`)
		
		if (!args[1]) {
			// no save provided
			const savefiles = sortModifiedDate(fs.readdirSync(`${this.client.config.serverpath}/${server.path}/saves`).map(path => `${this.client.config.serverpath}/${server.path}/saves/${path}`)).filter(save => save.path.endsWith(".zip"))
			const embed = new MessageEmbed()
				.setAuthor(message.guild.name, message.guild.iconURL())
				.setColor(this.client.config.embed.color)
				.setFooter(this.client.config.embed.footer)

			const content = savefiles.map(savefile => {
				return {
					name: `\`${savefile.path.slice(savefile.path.lastIndexOf("/") + 1, -(".zip".length))}\``,
					value: (new Date(savefile.mtime)).toISOString()
				}
			})

			createPagedEmbed(content, embed, message)
		} else {
			// specific save provided
			let save
			try {
				save = fs.statSync(`${this.client.config.serverpath}/${server.path}/saves/${args[1]}.zip`)
			} catch (e) {
				return message.channel.send(`\`${args[1]}\` is an invalid save!`)
			}
			const confirm = await getConfirmationMessage(message, `Are you sure you want to reset the save to \`${args[1]}\` from ${(new Date(save.mtime).toISOString())}?`)
			if (!confirm) return message.channel.send("Rollback cancelled")
			
			const command = [
				`${this.client.config.serverpath}/${server.path}/factorio-init/factorio stop`,
				`${this.client.config.serverpath}/${server.path}/factorio-init/factorio load-save ${args[1]}`,
				`${this.client.config.serverpath}/${server.path}/factorio-init/factorio start`
			].join(" && ")
			console.log(command)
			// return
			await runShellCommand(command).catch((e) => {
				return message.channel.send(`Error restoring: \`${e}\``);
			});
			setTimeout(() => {
				runShellCommand(`${this.client.config.serverpath}/${server.path}/factorio-init/factorio status`).then(res => {
					message.channel.send(res)
				}).catch((e) => message.channel.send(`Error statusing: ${e}`))
			}, 5000)
		}
	}
}

module.exports = Rollback;