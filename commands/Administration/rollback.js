const { MessageEmbed, MessageAttachment } = require("discord.js");
const Command = require("../../base/Command.js");
const serverJS = require("../../servers")
const { sortModifiedDate, runShellCommand } = require("../../helpers/functions")
const childprocess = require("child_process")
const fs = require("fs")

class Linkme extends Command {
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
			cooldown: 5000
		});
	}

	async run(message, args) {

	}
}

module.exports = Linkme;