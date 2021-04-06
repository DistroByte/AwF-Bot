const Command = require("../../base/Command"),
  { MessageEmbed } = require('discord.js'),
  fetch = require('node-fetch');

class Xkcd extends Command {
  constructor(client) {
    super(client, {
      name: "xkcd",
      description: "Gets an xkcd comic",
      usage: "(xkcd comic id)",
      dirname: __dirname,
      enabled: true,
      guildOnly: false,
      aliases: [],
      memberPermissions: [],
      botPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
      nsfw: false,
      ownerOnly: false,
      args: false,
      cooldown: 3000
    });
  }

  async run(message, args, data) {
    let search = args[0]
      ? `http://xkcd.com/${args[0]}/info.0.json`
      : 'http://xkcd.com/info.0.json';
    try {
      fetch(search)
        .then((res) => res.json())
        .then((res) => {
          if (!res)
            return message.channel.send(
              'No results found for this comic, sorry!'
            );
          let { safe_title, img, day, month, year, num, alt } = res;

          let embed = new MessageEmbed()
            .setColor('GREEN')
            .setDescription(alt ? alt : '*crickets* - No Description')
            .setAuthor(`XKCD | ${safe_title} [${num}]`)
            .setImage(img)
            .setFooter(`Published ${day}/${month}/${year}`);

          message.channel.send(embed);
        });
    } catch (e) {
      console.log(e);
      return message.channel.send('looks like I\'ve broken! Try again.');
    }
  }
}

module.exports = Xkcd;