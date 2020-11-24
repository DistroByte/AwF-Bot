const { MessageEmbed } = require("discord.js");
const { prefix } = require("../../botconfig.json");
const { readdirSync } = require("fs");
const { stripIndents } = require("common-tags");

module.exports = {
  config: {
    name: "help",
    aliases: ["h", "halp", "commands"],
    usage: "(command)",
    category: "basic",
    description: "Displays all available commands",
    accessableby: "Members",
  },
  run: async (client, message, args) => {
    const embed = new MessageEmbed()
      .setColor("GREEN")
      .setAuthor(`${message.guild.me.displayName} Help`, message.guild.iconURL)
      .setThumbnail(client.user.displayAvatarURL());

    if (!args[0]) {
      const categories = readdirSync("./commands/");

      embed.setDescription(
        `These are the avaliable commands for ${message.guild.me.displayName}\nThe bot prefix is: **${prefix}**`
      );
      embed.setFooter(
        `© ${message.guild.me.displayName} | Developed by DistroByte | Total Commands: ${client.commands.size}`,
        client.user.displayAvatarURL()
      );

      categories.forEach((category) => {
        const dir = client.commands.filter(
          (c) => c.config.category === category
        );
        const capitalise =
          category.slice(0, 1).toUpperCase() + category.slice(1);
        try {
          embed.addField(
            `${capitalise} [${dir.size}]:`,
            dir.map((c) => `\`${c.config.name}\``).join(" ")
          );
        } catch (e) {}
      });

      return message.channel.send(embed);
    } else {
      let command = client.commands.get(
        client.aliases.get(args[0].toLowerCase()) || args[0].toLowerCase()
      );
      if (!command)
        return message.channel.send(
          embed
            .setTitle("Invalid Command.")
            .setDescription(
              `Do \`${prefix}help\` for the list of the commands.`
            )
        );
      command = command.config;

      embed.setDescription(stripIndents`The bot's prefix is: \`${prefix}\`\n
            **Command:** ${
              command.name.slice(0, 1).toUpperCase() + command.name.slice(1)
            }
            **Description:** ${
              command.description || "No Description provided."
            }
            **Usage:** ${
              command.usage
                ? `\`${prefix}${command.name} ${command.usage}\``
                : `\`${prefix}${command.name}\``
            }
            **Accessible by:** ${command.accessableby || "Members"}
            **Aliases:** ${
              command.aliases ? command.aliases.join(", ") : "None"
            }`);
      embed.setFooter(
        `© ${message.guild.me.displayName} | Developed by DistroByte`,
        client.user.displayAvatarURL()
      );

      return message.channel.send(embed);
    }
  },
};
