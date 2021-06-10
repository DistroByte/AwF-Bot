const { MessageEmbed } = require("discord.js");
const Command = require("../../base/Command.js");
const serverJS = require("../../servers")
const rcon = require("../../helpers/rcon")

class Rconcmd extends Command {
  constructor(client) {
    super(client, {
      name: "rconcmd",
      description: "Send a RCON command (auto-prefixed with /))",
      usage: "[command]",
      examples: ["{{p}}rconcmd ban DistroByte", "{{p}}rconcmd /ban DistroByte"],
      dirname: __dirname,
      enabled: true,
      guildOnly: false,
      aliases: [],
      memberPermissions: ["MANAGE_GUILD"],
      botPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
      nsfw: false,
      ownerOnly: false,
			cooldown: 5000,
			customPermissions: ["RCON_CMD"],
    });
  }

  async run(message, args) {
    let toSendServer = {}
		if (!args[0]) return message.channel.send("No server provided!")
		if (!args[1]) return message.channel.send("No command provided!")
    if (message.mentions.channels.first()) {
      serverJS.forEach((server) => {
        if (server.path != "" && server.discordid == message.mentions.channels.first().id)
          toSendServer = server.discordid
      })
    } else {
      server = args[0];
    }

    const cmdArr = args.slice(1);
    const command = cmdArr.join(" ");
    let res = await rcon.rconCommand(command, toSendServer);
    if (typeof (res.resp) == "object")
      return message.channel.send(
        `Error. Command may have worked, but didn't give a response: ${res.resp}`
      );
    return message.channel.send(`Command worked. Output: \n \`${res.resp}\``);
  }

}

module.exports = Rconcmd;