const { searchOneDB, deleteOneDB } = require("../../functions");

module.exports = {
  config: {
    name: "unlinkuser",
    aliases: [""],
    usage: "<user ping/user ID>",
    category: "moderator",
    description: "Unink a Factorio user with a Factorio account",
    accessableby: "Moderators",
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
    const discordID = message.mentions.users.first() ? (message.mentions.users.first()).id : args[0];
    let db = await searchOneDB("otherData", "linkedPlayers", { discordID: discordID });
    if (db === null) return message.channel.send("User is not linked!");
    let res = await deleteOneDB("otherData", "linkedPlayers", db);
    if (res.result.ok) return message.channel.send(`User ${discordID} successfully unlinked!`);
    console.error(res);
    return message.channel.send(`Error linking!`);
  }
}