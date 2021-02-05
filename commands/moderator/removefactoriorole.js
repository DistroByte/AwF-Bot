const Discord = require("discord.js");
const { searchOneDB, removeFactorioRole } = require("../../functions");
const { ErrorManager } = require("../../utils/error-manager");

module.exports = {
  config: {
    name: "removefactoriorole",
    aliases: [],
    usage: "<mention/Factorio name> <role name>",
    category: "moderator",
    description: "Removes Factorio role from a user",
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
    if (!args[1])
      return message.channel.send("Give role to remove!")
    
    let username;
    if (message.mentions.users.first()) {
      let res = await searchOneDB("otherData", "linkedPlayers", {
        discordID: (message.mentions.users.first()).id,
      })
      if (res == undefined)
        return message.channel.send("User not linked!");
        username = res.factorioName;
    } else {
      username = args[0];
    }
    const role = args[1];
    let res = await removeFactorioRole(username, role);
    if (res == false) return message.channel.send("User doesn't have roles!")
    if (res.ok == true)
      return message.channel.send("Removed role successfully!");
    return message.channel.send("Error adding to database");
  },
};
