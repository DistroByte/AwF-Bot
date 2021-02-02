const { searchOneDB, insertOneDB } = require("../../functions");

module.exports = {
  config: {
    name: "linkuser",
    aliases: [""],
    usage: "<user ping/user ID> <Factorio name>",
    category: "moderator",
    description: "Link a Factorio user with a Factorio account",
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
    args.shift();
    let db = await searchOneDB("otherData", "linkedPlayers", { discordID: discordID });
    if (db !== null) return message.channel.send("User is already linked!");
    const factorioName = args.join(" ");
    const toWrite = {
      discordID: discordID,
      factorioName: factorioName,
    }
    let res = await insertOneDB("otherData", "linkedPlayers", toWrite);
    if (res.result.ok) return message.channel.send(`User ${discordID} successfully linked to ${factorioName}!`);
    console.error(res);
    return message.channel.send(`Error linking!`);
  }
}