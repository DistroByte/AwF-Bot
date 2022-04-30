import { Message, MessageEmbed } from "discord.js";
import { Command } from "../../base/Command";

const Help: Command<Message> = {
  name: "help",
  description: "Show commands list or specific command help",
  usage: "(command)",
  category: "General",
  examples: ["{{p}}help", "{{p}}help ping"],
  dirname: __dirname,
  enabled: true,
  guildOnly: false,
  aliases: ["h", "commands"],
  memberPermissions: [],
  botPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
  nsfw: false,
  ownerOnly: false,
  run: async ({ client, message, args }) => {
    const prefix = client.config.prefix;
    if (args[0]) {
      const cmd =
        client.commands.get(args[0]) ||
        client.commands.get(client.aliases.get(args[0]));
      if (!cmd) {
        return message.channel.send(
          `\`${args[0]}\` is not a valid command\nType \`${prefix}help\` to see a list of available commands!`
        );
      }

      const description = cmd.description ? cmd.description : "No description";
      const usage = cmd.usage
        ? "```\n" + prefix + cmd.name + " " + cmd.usage + "\n```"
        : prefix + cmd.name;
      const examples = cmd.examples
        ? `\`\`\`${cmd.examples.join("\n").replace(/\{\{p\}\}/g, prefix)}\`\`\``
        : `\`\`\`${prefix}${cmd.name}\`\`\``;

      // Creates the help embed
      const groupEmbed = new MessageEmbed()
        .setAuthor(`${prefix}${cmd.name} help`)
        .addField("Description", description)
        .addField("Usage", usage)
        .addField("Examples", examples)
        .addField(
          "Aliases",
          cmd.aliases.length > 0
            ? cmd.aliases.map((a) => `\`${a}\``).join(",")
            : "No aliases"
        )
        .addField(
          "Member permissions requried",
          cmd.memberPermissions.length > 0
            ? cmd.memberPermissions.map((p) => "`" + p + "`").join("\n")
            : "No specific permission is required to execute this command"
        )
        .setColor(client.config.embed.color)
        .setFooter(client.config.embed.footer);
      if (cmd.customPermissions) {
        const neededRoleIds = cmd.customPermissions
          .map((permname) =>
            client.config.customPermissions.find((p) => p.name === permname)
          )
          .filter((r) => r)
          .map((p) => p.roleid);
        const neededRoles = await Promise.all(
          neededRoleIds.map((roleid) => message.guild.roles.fetch(roleid))
        ).then((r) => r.filter((r) => r));
        if (neededRoles.length)
          groupEmbed.addField(
            "You can also use these roles instead",
            neededRoles.join("`, `")
          );
      }

      // and send the embed in the current channel
      return message.channel.send({ embeds: [groupEmbed] });
    }

    const categories = [];
    const commands = client.commands;

    commands.forEach((command) => {
      if (!categories.includes(command.category)) {
        if (
          command.category === "Owner" &&
          !message.member.roles.cache.get(client.config.adminroleid)
        ) {
          return;
        }
        categories.push(command.category);
      }
    });

    const emojis = client.emotes;

    const embed = new MessageEmbed()
      .setDescription(
        `● To get help on a specific command type\`${prefix}help <command>\`!`
      )
      .setColor(client.config.embed.color)
      .setFooter(client.config.embed.footer);
    categories.sort().forEach((cat) => {
      const tCommands = commands.filter((cmd) => cmd.category === cat);
      embed.addField(
        cat + " - (" + tCommands.size + ")",
        tCommands.map((cmd) => "`" + cmd.name + "`").join(", ")
      );
    });

    embed.addField(
      "\u200B",
      `[Dashboard](https://dashboard.dbyte.xyz) ● [Donate](https://www.patreon.com/distrobyte) ● [Invite](${client.config.inviteURL}) ● [Support](${client.config.supportURL}) ● [Github](https://www.github.com/DistroByte)`
    );
    embed.setAuthor({
      name: `${client.user.username} | Commands`,
      iconURL: client.user.displayAvatarURL(),
    });
    return message.channel.send({
      embeds: [embed],
    });
  },
};

export default Help;
