const Command = require("../../base/Command.js"),
  Discord = require("discord.js");

class Announcement extends Command {

  constructor(client) {
    super(client, {
      name: "announcement",
      description: "Send an announcement in the current channel!",
      usage: "[text]",
      examples: ["{{p}}announcement New staff member!"],
      dirname: __dirname,
      enabled: true,
      guildOnly: true,
      aliases: ["announce"],
      memberPermissions: ["MENTION_EVERYONE"],
      botPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
      nsfw: false,
      ownerOnly: false,
      cooldown: 3000
    });
  }

  async run(message, args, data) {

    const text = args.join(" ");
    if (!text) {
      return message.channel.send("You must enter the announcement text!");
    }
    if (text.length > 1030) {
      return message.channe.send("Your text should be shorter than 1030 characters!");
    }

    message.delete().catch(() => { });

    let mention = "";

    const msg = await message.channel.send("Would you like to add a mention to your message?\nAnswer by sending `yes` or `no`!");

    const collector = new Discord.MessageCollector(message.channel, (m) => m.author.id === message.author.id, { time: 240000 });

    collector.on("collect", async (tmsg) => {

      if (tmsg.content.toLowerCase() === "no") {
        tmsg.delete();
        msg.delete();
        collector.stop(true);
      }

      if (tmsg.content.toLowerCase() === "yes") {
        tmsg.delete();
        msg.delete();
        const tmsg1 = await message.channel.send("Choose to mention `@`everyone by typing `every` or to mention `@`here by typing `here`!");
        const c = new Discord.MessageCollector(message.channel, (m) => m.author.id === message.author.id, { time: 60000 });
        c.on("collect", (m) => {
          if (m.content.toLowerCase() === "here") {
            mention = "@here";
            tmsg1.delete();
            m.delete();
            collector.stop(true);
            c.stop(true);
          } else if (m.content.toLowerCase() === "every") {
            mention = "@everyone";
            tmsg1.delete();
            m.delete();
            collector.stop(true);
            c.stop(true);
          }
        });
        c.on("end", (collected, reason) => {
          if (reason === "time") {
            return message.channel.send("Time's up! Please send the command again!");
          }
        });
      }
    });

    collector.on("end", (collected, reason) => {

      if (reason === "time") {
        return message.channel.send("Time's up! Please send the command again!");
      }

      const embed = new Discord.MessageEmbed()
        .setAuthor("📢 Announcement")
        .setColor(data.config.embed.color)
        .setFooter(message.author.tag)
        .setTimestamp()
        .setDescription(text);

      message.channel.send(mention, embed);
    });
  }
}

module.exports = Announcement;