const Discord = require("discord.js");
const { RconConnectionManager } = require("../../utils/rcon-connection");
const serverJson = require("../../servers.json");
const { on } = require("npm");

module.exports = {
  config: {
    name: "onlineplayers",
    aliases: ["op", "playersonline", "po"],
    usage: "",
    category: "factorio",
    description: "View online players across all servers",
    accessableby: "Members",
  },
  run: async (client, message, args) => {
    let onlinePlayers = new Discord.MessageEmbed()
      .setTitle(`Online Players`)
      .setDescription(`Online players on Factorio servers`)
      .setColor("GREEN")
      .setAuthor(`${message.guild.me.displayName} Help`, message.guild.iconURL)
      .setThumbnail(client.user.displayAvatarURL())
      .setFooter(
        `© ${message.guild.me.displayName} | Developed by DistroByte & oof2win2 | Total Commands: ${client.commands.size}`,
        client.user.displayAvatarURL()
      );
    
    const res = await RconConnectionManager.rconCommandAll('/p o');
    res.forEach((out) => {
      try {
        if (typeof (out[0]) == "object") throw out
        if (out[0].length > 1024) throw Error("Response too long!");
        else onlinePlayers.addField(`${out[1].discordChannelName}`, out[0]);
      } catch (error) {
        onlinePlayers.addField(`${out[1].discordChannelName}`, error);
        console.error(error);
      }
    });
    return message.channel.send(onlinePlayers);
  },
};
