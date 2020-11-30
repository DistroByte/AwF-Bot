const Discord = require("discord.js");
const { searchOneDB } = require("../../functions");

module.exports = {
  config: {
    name: "statsg",
    aliases: ["gstats", "globalstats"],
    usage: "<discord username (JammyBot)/ping user>",
    category: "factorio",
    description: "View global server statistics",
    accessableby: "Members",
  },
  run: async (client, message, args) => {
    if (!args[0]) {
      // no argument at all
      return message.reply(
        "Please supply with Discord username to see statistics"
      );
    }
    if (!args[1]) {
      var user;
      if (message.mentions.users.first()) user = message.mentions.users.first();
      else {
        let server = await client.guilds.cache.get("548410604679856151");
        user = await server.members.fetch({ query: args[0], limit: 1 });
        user = user.first().user;
      }
      let data = await searchOneDB("otherData", "globPlayerStats", {
        discordID: user.id,
      });
      if (data == null)
        return message.channel.send(
          `User \`${user.username}\` not found in database, maybe try linking (\`!linkme <discordUsername>\` in a Factorio chat, allow PMs fro channels)`
        );
      let dataEmbed = new Discord.MessageEmbed()
        .setTitle("Global Statistics")
        .setDescription(
          "Display the global statistics of a player. Points are as following: 50/hour played, 1 per entity built, -100 for death. Displayed points are rounded"
        )
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
      if (data.time)
        dataEmbed.addField("Time Played (minutes)", parseInt(data.time));
      if (data.built) dataEmbed.addField("Entities Built", data.built);
      if (data.deaths) dataEmbed.addField("Deaths", data.deaths);
      if (data.points)
        dataEmbed.addField("Total points", parseInt(data.points));
      return message.channel.send(dataEmbed);
    }
  },
};
