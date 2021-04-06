const Command = require("../../base/Command.js"),
  Discord = require("discord.js");

const currentGames = {};

class Number extends Command {

  constructor(client) {
    super(client, {
      name: "number",
      description: "Find the right number!",
      dirname: __dirname,
      enabled: true,
      guildOnly: true,
      aliases: [],
      memberPermissions: [],
      botPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
      nsfw: false,
      ownerOnly: false,
      cooldown: 5000
    });
  }

  async run(message) {

    if (currentGames[message.guild.id]) {
      return message.channel.send("A game is already running on this server!");
    }

    const participants = [];
    const number = Math.floor(Math.random() * 3000);

    await message.channel.send("Number chosen, you can start!");

    // Store the date wich the game has started
    const gameCreatedAt = Date.now();

    const collector = new Discord.MessageCollector(
      message.channel, m => !m.author.bot, { time: 480000 }
    );
    currentGames[message.author.id] = message.author.id;

    collector.on("collect", async msg => {
      if (!participants.includes(msg.author.id)) {
        participants.push(msg.author.id);
      }

      // if it's not a number, return
      if (isNaN(msg.content)) {
        return;
      }

      const parsedNumber = parseInt(msg.content, 10);

      if (parsedNumber === number) {
        const time = this.client.functions.convertTime(message.guild, Date.now() - gameCreatedAt);
        message.channel.send(`🎉 | ${msg.author.toString()} found the correct number! It was __**${number}**__!\n\n **Stats:**\n*-* __** Duration **__: ${time}\n*-* __**Participants**__: ${participants.map(p => `<@${p}>`).join("\n")} (${participants.length})`);
        message.channel.send(`${msg.author.toString()} has won 10 credits!`);
        const userdata = await this.client.findOrCreateMember({ id: msg.author.id, guildID: message.guild.id });
        userdata.money = userdata.money + 10;
        userdata.save();
        collector.stop(msg.author.username);
      }
      if (parseInt(msg.content) < number) {
        message.channel.send(`${msg.author.toString()} | My number is **bigger** than \`${parsedNumber}\`!`)
      }
      if (parseInt(msg.content) > number) {
        message.channel.send(`${msg.author.toString()} | My number is **smaller** than \`${parsedNumber}\`!`)
      }
    });

    collector.on("end", (_collected, reason) => {
      delete currentGames[message.guild.id];
      if (reason === "time") {
        return message.channel.send(`No one could find the number! It was **${number}** !`);
      }
    });
  }

}

module.exports = Number;
