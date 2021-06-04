const { MessageEmbed, MessageAttachment } = require("discord.js")
const Command = require("../../base/Command.js");
const { runShellCommand } = require("../../helpers/functions")

class Shellcmd extends Command {
	constructor(client) {
		super(client, {
			name: "shellcmd",
			description: "Send a shell command to the server",
			usage: "[...command]",
			aliases: [],
			examples: ["{{p}}shellcmd ls"],
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
		const res = await runShellCommand(args.join(" "))
		let file = new MessageAttachment(Buffer.from(res), "output.txt")
		return message.channel.send("Sending command output", {files: [file]})
	}
}

module.exports = Shellcmd;