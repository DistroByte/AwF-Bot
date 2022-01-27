import { Message, MessageAttachment } from "discord.js";
import { Command } from "../../base/Command.js";
import serverJS from "../../servers";
import lastLines from "read-last-lines"

const Rollback: Command<Message> = {
	name: "getlogs",
	description: "Get logs from a Factorio server",
	usage: "(channel) [logcount]",
	category: "Administration",
	aliases: [],
	examples: ["{{p}}getlogs #awf-regular 50"],
	dirname: __dirname,
	enabled: true,
	guildOnly: false,
	memberPermissions: ["ADMINISTRATOR"],
	botPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
	nsfw: false,
	ownerOnly: false,
	customPermissions: ["MANAGE_SERVER"],
	run: async ({ client, message, args }) => {
		if (!message.mentions.channels.first())
			return message.reply("No channel to get logs of provided!");
		args.shift(); // remove mention
		const lineCount = Math.min(Number(args.shift()) || 50, 200)
		const server = serverJS.find(
			(server) => server.discordid === message.mentions.channels.first().id
		);
		if (!server) return message.reply("Invalid channel, not tied to a server!");
		const fullPath = `${client.config.serverpath}/${server.path}/factorio-current.log`
		const lines = await lastLines.read(fullPath, lineCount < 0 ? lineCount : 50)
		const attachment = new MessageAttachment(Buffer.from(lines), "log.txt")
		return message.channel.send(`Logs for <#${server.discordid}> are sent as an attachement`, {files: [attachment]})
	},
};

export default Rollback;
