const Discord = require("discord.js");
const { searchOneDB, giveFactorioRole, insertOneDB, findOneAndReplaceDB } = require("../../functions");
const { LinkingCache } = require("../../functions");
const { ErrorManager } = require("../../utils/error-manager");
const lodash = require("lodash");
let { linkConfirmation } = require("../../config/messages.json")

module.exports = {
  config: {
    name: "givefactoriorole",
    aliases: [],
    usage: "<mention/Factorio name> <role name>",
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
    if (!args[1])
      return message.channel.send("Give role to assign!")
    
    let user;
    if (message.mentions.users.first()) {
      let res = await searchOneDB("otherData", "linkedPlayers", {
        discordID: (message.mentions.users.first()).id,
      })
      if (res == undefined)
        return message.channel.send("User not linked!");
      user = res.factorioName;
    } else {
      user = args[0];
    }
    const role = args[1];
    let res = await giveFactorioRole(user, role);
    if (res == false) return message.channel.send("User already has role!");
    if (res.ok == true)
      return message.channel.send("Assigned role successfully!");
    return message.channel.send("Error adding to database");
  },
};
