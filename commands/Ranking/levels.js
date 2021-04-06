const { MessageEmbed } = require("discord.js");
const Command = require("../../base/Command");

class Levels extends Command {
  constructor(client) {
    super(client, {
      name: "levels",
      description: "Shows the server leaderboard",
      dirname: __dirname,
      enabled: true,
      guildOnly: true,
      aliases: ["ranks"],
      memberPermissions: [],
      botPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
      nsfw: false,
      ownerOnly: false,
      args: false,
      cooldown: 3000
    });
  }

  async run(message, args, data) {
    const user = message.author;

    let memberXp = new Map();
    data.guild.members.forEach(m => { memberXp.set(m.id, m.xp) });
    let leaderboard = [];

    var sortable = new Map([...memberXp.entries()].sort(function (a, b) {
      return b[1] - a[1];
    }));

    var authorRank = 1
    var ranks = 1
    for (var [key, value] of sortable.entries()) {
      if (key == user.id) {
        authorRank = ranks;
      }
      leaderboard.push(`\`${ranks}\` **${message.guild.members.cache.get(key)}** *at lvl* ${this.client.functions.getLevel(value) || 0}`);
      ranks += 1;
    }

    var page = 1

    let embed = new MessageEmbed()
      .setTitle(`Leaderboard`)
      .setColor(this.client.config.embed.colour)
      .setThumbnail(message.guild.iconURL)
      .setFooter(`Page ${page}`)

    let slice = 0;
    leaderboard.length >= 10 ? slice = 10 : slice = leaderboard.length;

    embed.addField(`You (${message.member.displayName}) are rank #${authorRank} (page ${Math.floor(authorRank / 10) + 1})`, leaderboard.slice(0, slice));
    message.channel.send(embed);
  }
}

module.exports = Levels;