const Discord = require("discord.js");
const { getFactorioRoles } = require("../../functions");
const { LinkingCache } = require("../../functions");
const { ErrorManager } = require("../../utils/error-manager");
const lodash = require("lodash");
let { linkConfirmation } = require("../../config/messages.json");
const { DatabaseConnection } = require("../../utils/database-manager");

module.exports = {
  config: {
    name: "getfactorioroles",
    aliases: [],
    usage: "<mention/Factorio name>",
    category: "moderator",
    description: "Gives a user a Factorio role",
    accessableby: "Moderator",
  },
  run: async (client, message, args) => {
    let authRoles = message.member.roles.cache;
    if (
      !authRoles.some((r) => ["Admin", "Moderator", "dev"].includes(r.name))
    ) {
      // if user is not Admin/Moderator/dev
      return message.channel.send(
        "You don't have enough priviliges to run this command!"
      );
    }
    if (!args[0] && !message.mentions.users.first())
      return message.channel.send("Give a Factorio name/Discord ping!")
    let user;
    if (message.mentions.users.first()) {
      let res = await DatabaseConnection.findOneDB("otherData", "linkedPlayers", {
        discordID: (message.mentions.users.first()).id,
      })
      if (res == undefined)
        return message.channel.send("User not linked!");
      user = res.factorioName;
    } else {
      user = args[0];
    }
    
    let rolesEmbed = new Discord.MessageEmbed()
    .setTitle("Roles of a Factorio player")
    .setDescription("Roles of a Factorio player")
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
    const roles = (await getFactorioRoles(user)).roles;
    rolesEmbed.addField("\u200B", roles.join(", "));
    return message.channel.send(rolesEmbed);
  },
};
