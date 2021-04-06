const Command = require("../../base/Command.js"),
  ms = require("ms");

class Giveaway extends Command {

  constructor(client) {
    super(client, {
      name: "giveaway",
      description: "Easily manage your giveaways!",
      usage: "[create/reroll/delete/end] (time) (winners count) (prize)",
      examples: ["{{p}}giveaway create 10m 2 5$ PayPal!\n{{p}}giveaway reroll 597812898022031374"],
      dirname: __dirname,
      enabled: true,
      guildOnly: true,
      aliases: ["gway"],
      memberPermissions: ["MENTION_EVERYONE"],
      botPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
      nsfw: false,
      ownerOnly: false,
      cooldown: 5000
    });
  }

  async run(message, args, data) {

    const status = args[0];
    if (!status) {
      return message.channel.send("You must specify an action between `create`, `reroll`, `end` or `delete`!");
    }

    if (status === "create") {
      const currentGiveaways = this.client.giveawaysManager.giveaways.filter((g) => g.guildID === message.guild.id && !g.ended).length;
      if (currentGiveaways > 3) {
        return message.channel.send("There can only be 4 simultaneous giveaways.");
      }
      const time = args[1];
      if (!time) {
        return message.channel.send(`You must enter the information like this: \n\n\`${data.guild.prefix}giveaway create [time] [winners count] [prize]\``)
      }
      if (isNaN(ms(time))) {
        return message.channel.send("You must enter a valid time! Available units: `s`, `m`, `h` or `d`");
      }
      if (ms(time) > ms("15d")) {
        return message.channel.send("The maximum duration of a giveaway is 15 days.");
      }
      const winnersCount = args[2];
      if (!winnersCount) {
        return message.channel.send(`You must enter the information like this: \n\n\`${data.guild.prefix}giveaway create [time] [winners count] [prize]\``);
      }
      if (isNaN(winnersCount) || winnersCount > 10 || winnersCount < 1) {
        return message.channel.send(`Please specify a valid number between **1** and **10**!`)
      }
      const prize = args.slice(3).join(" ");
      if (!prize) {
        return message.channel.send(`You must enter the information like this: \n\n\`${data.guild.prefix}giveaway create [time] [winners count] [prize]\``);
      }
      this.client.giveawaysManager.start(message.channel, {
        time: ms(time),
        prize: prize,
        winnerCount: parseInt(winnersCount, 10),
        messages: {
          giveaway: "🎉🎉 **GIVEAWAY** 🎉🎉",
          giveawayEnded: "🎉🎉 **GIVEAWAY ENDED** 🎉🎉",
          timeRemaining: `Time remaining: **${time}**!`,
          inviteToParticipate: "React with 🎉 to participate!",
          winMessage: `Congratulations, {winners}! You won **${prize}**!`,
          embedFooter: "Giveaways",
          noWinner: "Giveaway cancelled, no valid participation.",
          winners: "winner(s)",
          endedAt: "End at",
          units: {
            seconds: "Seconds",
            minutes: "Minutes",
            hours: "Hours",
            days: "Days"
          }
        }
      }).then(() => {
        message.channel.send("Giveaway launched!");
      });
    } else if (status === "reroll") {
      const messageID = args[1];
      if (!messageID) {
        return message.channel.send("You must enter the giveaway message ID!");
      }
      this.client.giveawaysManager.reroll(messageID, {
        congrat: "🎉 New winner(s): {winners}! Congratulations!",
        error: "No valid entries, no winners can be chosen!"
      }).then(() => {
        return message.channel.send("Giveaway re-rolled!");
      }).catch(() => {
        return message.channel.send(`No **ended** giveaway found with message ID \`${messageID}\``);
      });
    } else if (status === "delete") {
      const messageID = args[1];
      if (!messageID) {
        return message.channel.send("You must enter the giveaway message ID!");
      }
      this.client.giveawaysManager.delete(messageID).then(() => {
        return message.channel.send("Giveaway deleted!");
      }).catch(() => {
        return message.channel.send(`No giveaway found with message ID \`${messageID}\``);
      });
    } else if (status === "end") {
      const messageID = args[1];
      if (!messageID) {
        return message.channel.send(`No giveaway found with message ID \`${messageID}\``);
      }
      try {
        this.client.giveawaysManager.edit(messageID, {
          setEndTimestamp: Date.now()
        });
        return message.channel.send("The giveaway will end in less than 15 seconds!");
      } catch (e) {
        return message.channel.send(`No giveaway found with message ID \`${messageID}\``);
      }
    } else {
      return message.channel.send("You must specify an action between `create`, `reroll`, `end` or `delete`!");
    }
  }
}

module.exports = Giveaway;