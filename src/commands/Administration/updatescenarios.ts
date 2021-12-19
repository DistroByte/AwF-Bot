import { Message, MessageEmbed } from "discord.js";
import { Command } from "../../base/Command.js";
import serverJS from "../../servers";
import config from "../../config";
import {
  bubbleSort,
  getServerFromChannelInput,
  runShellCommand,
} from "../../helpers/functions";
import fs from "fs";
import servers from "../../servers";
const { serverpath } = config;

const UpdateScenarios: Command<Message> = {
  name: "updatescenarios",
  description: "Update scenarios",
  category: "Administration",
  dirname: __dirname,
  enabled: true,
  guildOnly: false,
  aliases: [],
  memberPermissions: ["MANAGE_GUILD"],
  botPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
  nsfw: false,
  ownerOnly: false,
  customPermissions: ["MANAGE_SERVER"],
  run: async ({ client, message, args }) => {
    const scenarios = fs.readdirSync(client.config.scenarioRootPath)
		const results =	await Promise.all(
			scenarios.map(async (scenarioName): Promise<string[]> => {
				return [scenarioName, await runShellCommand(`cd ${client.config.scenarioRootPath}/${scenarioName} && git pull 1>/dev/null`).catch(x=>x)]
			})
		)
		const final = results
			.map(result => {
				if (result[1]) return result[0]
				return false
			})
			.filter((x): x is string => Boolean(x))

		return message.channel.send(`Scenarios updated. ${final.length ? `\`${final.join("`, `")}\` had issues` : "No issues updating"}`)
  },
};

export default UpdateScenarios;
