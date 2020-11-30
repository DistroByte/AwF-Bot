const { MessageEmbed } = require("discord.js");
const { rconCommandAll } = require("../../functions");
const serverJson = require("../../servers.json");

module.exports = {
  config: {
    name: "rconcmdall",
    aliases: ["rconcommandall", "sendcmdall", "fcommandall"],
    usage: "<factorio rcon command>",
    category: "moderator",
    description: "Sends a command to all Factorio servers",
    accessableby: "Moderators",
  },
  run: async (client, message, args) => {
    let authRoles = message.member.roles.cache;

    if (
      authRoles.some((r) => r.name === "Admin") ||
      authRoles.some((r) => r.name === "Moderator") ||
      authRoles.some((r) => r.name === "dev")
    ) {
      const command = args.join(" ");
      const res = await rconCommandAll(command);
      let outEmbed = new MessageEmbed()
        .setTitle(`RCON Output`)
        .setDescription(`Output of RCON command to all servers`)
        .setColor("GREEN")
        .setAuthor(
          `${message.guild.me.displayName} Help`,
          message.guild.iconURL
        )
        .setThumbnail(client.user.displayAvatarURL())
        .setFooter(
          `© ${message.guild.me.displayName} | Developed by DistroByte & oof2win2 | Total Commands: ${client.commands.size}`,
          client.user.displayAvatarURL()
        );
      res.forEach((out) => {
        if (out[0][1].startsWith("error"))
          outEmbed.addField(`Server ${out[1]}`, out[0][1]);
        else outEmbed.addField(`Server ${out[1]}`, out[0][0]);
      });
      return message.channel.send(outEmbed);
    }
  },
};
