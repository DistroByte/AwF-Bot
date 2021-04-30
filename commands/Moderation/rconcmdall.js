const { MessageEmbed } = require("discord.js");
const Command = require("../../base/Command.js");
const serverJS = require("../../servers")
const rcon = require("../../helpers/rcon")

class Linkme extends Command {
  constructor(client) {
    super(client, {
      name: "rconcmdall",
      description: "Send a RCON command to all servers (prefixed with /)",
      usage: "/<command>",
      examples: ["{{p}}rconcmdall /ban DistroByte"],
      dirname: __dirname,
      enabled: true,
      guildOnly: false,
      aliases: [],
      memberPermissions: [],
      botPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
      nsfw: false,
      ownerOnly: false,
      cooldown: 5000
    });
  }

  async run(message, args) {
    let outEmbed = new MessageEmbed()
      .setTitle(`RCON Output`)
      .setDescription(`Output of RCON command to all servers`)
      .setColor("GREEN")
      .setAuthor(
        `${message.guild.me.displayName} Help`,
        message.guild.iconURL
      )
      .setThumbnail(this.client.user.displayAvatarURL())
      .setFooter(
        `© ${message.guild.me.displayName} | Developed by DistroByte & oof2win2 | Total Commands: ${this.client.commands.size}`,
        this.client.user.displayAvatarURL()
      );
    const command = args.join(" ");
    const res = await rcon.rconCommandAll(command);
    res.forEach((out) => {
      try {
        if (typeof (out[0]) == "object") throw out
        if (out[0] && out[0].length > 1024) throw Error("Response too long!");
        else outEmbed.addField(`${out[1].discordname}`, out[0]);
      } catch (error) {
        outEmbed.addField(`${out[1].discordname}`, error);
        console.error(error);
      }
    });
    return message.channel.send(outEmbed);
  }

}

module.exports = Linkme;