const Discord = require("discord.js");
const { searchOneDB, giveFactorioRole, insertOneDB, findOneAndReplaceDB } = require("../../functions");
const { LinkingCache } = require("../../functions");
const { ErrorManager } = require("../../utils/error-manager");
const lodash = require("lodash");
let { linkConfirmation } = require("../../config/messages.json")

module.exports = {
  config: {
    name: "linkme",
    aliases: [],
    usage: "<linking ID>",
    category: "factorio",
    description: "Link yourself to Factorio",
    accessableby: "Members",
  },
  run: async (client, message, args) => {
    if (!args[0]) {
      return message.channel.send("Provide a linking ID!");
    }
    let linkingID
    try {
      linkingID = parseInt(args[0]);
      if (Number.isNaN(linkingID)) return message.channel.send("Provide a number given by the server, not a string!"); 
    } catch (error) {
      ErrorManager.Error(error);
      return message.channel.send(`Error: ${error}`);
    }
    const factorioName = LinkingCache.take(linkingID);
    if (factorioName === undefined)
      return message.channel.send("Wrong linking ID or timed out!");
    
    linkConfirmation = linkConfirmation.replace("%%USERNAME%%", message.author.username);
    linkConfirmation = linkConfirmation.replace("%%FACTORIONAME%%", factorioName)
    let confirmationMsg = await message.channel.send(linkConfirmation);
    confirmationMsg.react("✅");
    confirmationMsg.react("🔨");
    confirmationMsg.react("❌");
    
    const filter = (reaction, user) => {
      return user.id == message.author.id;
    }

    let reactions;
    try {
      reactions = await confirmationMsg.awaitReactions(filter, { max: 1, time:  60 * 1000, errors: ["time"]});
    } catch (error) {
      if (error.size === 0) return message.channel.send("Timed out!")
      else ErrorManager.Error(error);
      return message.channel.send("Error getting reaction");
    }
    const reaction = reactions.first();
    const dat = { factorioName: factorioName, discordID: message.author.id };
    const found = await searchOneDB("otherData", "linkedPlayers", {
      discordID: message.author.id,
    });

    if (reaction.emoji.name == "❌")
      return message.channel.send("Linking cancelled!");
    if (found !== null && reaction.emoji.name === "🔨") {
      // re-link user
      let res = await findOneAndReplaceDB(
        "otherData",
        "linkedPlayers",
        found,
        dat
      );
      if (res.ok != 1)
        return message.channel.send(
          "Please contact devs/admins for re-linking, process failed"
        );
      //redo statistics
      let prevStats = await searchOneDB("otherData", "globPlayerStats", {
        discordID: found.discordID,
      });
      let newStats = lodash.cloneDeep(prevStats);
      newStats.factorioName = factorioName;
      res = await findOneAndReplaceDB(
        "otherData",
        "globPlayerStats",
        prevStats,
        newStats
      );
      if (res.ok != 1)
        return message.channel.send(
          "Please contact devs/admins for re-linking, process failed"
        );
      message.channel.send("Re-linked succesfully!");
      giveFactorioRole(factorioName, "Member"); // give the Member role to new players
    }
    if (found !== null && reaction.emoji.name == "✅") return message.channel.send("Already linked!");
    if (found === null && reaction.emoji.name == "✅") {
      const toInsert = {
        factorioName: `${factorioName}`,
        discordID: `${message.author.id}`,
      }
      try {
        giveFactorioRole(factorioName, "Member"); // give the Member role to new players
        let res = await insertOneDB("otherData", "linkedPlayers", toInsert);
        if (res.result.ok == true) return message.channel.send("Linked successfully!");
        else return message.channel.send("Didn't insert correctly into database");
      } catch (error) {
        ErrorManager.Error(error);
        return message.channel.send("Error inserting into database");
      }
    }
  },
};
