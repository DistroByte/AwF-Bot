const Command = require("../../base/Command");

class Rps extends Command {
  constructor(client) {
    super(client, {
      name: "rps",
      description: "Play rock, paper, scissors against the bot!",
      usage: "[rock/paper/scissors]",
      examples: ["{{p}}rps rock", "{{p}}rps paper", "{{p}}rps scissors"],
      dirname: __dirname,
      enabled: true,
      guildOnly: false,
      aliases: [],
      memberPermissions: [],
      botPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
      nsfw: false,
      ownerOnly: false,
      cooldown: 3000
    });
  }

  async run(message, args, data) {
    let rps = ['rock', 'paper', 'scissors'];

    if (!args[0] || !rps.includes(args[0])) {
      return message.channel.send("Please specify either rock, paper or scissors")
    }

    let botChoice = rps[Math.floor(Math.random() * rps.length)];
    let userChoice = args[0];

    if (
      (userChoice === 'rock' && botChoice === 'scissors') ||
      (userChoice === 'paper' && botChoice === 'rock') ||
      (userChoice === 'scissors' && botChoice === 'paper')
    ) {
      message.channel.send(`**You Won!** ${userChoice} vs ${botChoice}!\nYou won 10 credits!`);
      const userdata = await this.client.findOrCreateMember({ id: msg.author.id, guildID: message.guild.id });
      userdata.money = userdata.money + 10;
      userdata.save();
    } else if (userChoice === botChoice) {
      message.channel.send(`**It's a draw!** We both picked ${botChoice}!`);
    } else {
      message.channel.send(`**You Lost!** ${userChoice} vs ${botChoice}!\nYou lost 10 credits!`);
      const userdata = await this.client.findOrCreateMember({ id: msg.author.id, guildID: message.guild.id });
      userdata.money = userdata.money - 10;
      userdata.save();
    }
  }
}

module.exports = Rps;