const Command = require("../../base/Command.js"),
  Discord = require("discord.js"),
  math = require("mathjs");

class Calc extends Command {
  constructor(client) {
    super(client, {
      name: "calc",
      description: "Calculator able to solve complex operations and to convert units!",
      usage: "[calculation]",
      examples: ["{{p}}calc 10 * 5 + sin(3)", "{{p}}calc 10cm to m"],
      dirname: __dirname,
      enabled: false,
      guildOnly: false,
      aliases: [],
      memberPermissions: [],
      botPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
      nsfw: false,
      ownerOnly: false,
      cooldown: 1000
    });
  }

  async run(message, args, data) {

    if (!args[0]) {
      return message.channel.send('Please enter a calculation!');
    }

    let result;
    try {
      result = math.evaluate(args.join(" ").replace(/[x]/gi, "*").replace(/[,]/g, ".").replace(/[÷]/gi, "/"));
    } catch (e) {
      return message.channel.send("Please enter a **valid** calculation!");
    }

    const embed = new Discord.MessageEmbed()
      .setColor(data.config.embed.color)
      .setAuthor("Calculator", this.client.user.displayAvatarURL())
      .addField("Calculation", `\`\`\`js\n${args.join("").replace(/[x]/gi, "*").replace(/[,]/g, ".").replace(/[÷]/gi, "/")}\`\`\``)
      .addField("Result", `\`\`\`js\n${result}\`\`\``)
      .setFooter(data.config.embed.footer);
    message.channel.send(embed);

  }
}

module.exports = Calc;
