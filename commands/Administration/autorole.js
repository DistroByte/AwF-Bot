const Command = require("../../base/Command.js"),
  Resolvers = require("../../helpers/resolvers");

class Autorole extends Command {

  constructor(client) {
    super(client, {
      name: "autorole",
      description: "Toggle autorole on the server!",
      usage: '[on/off] (role)',
      examples: ['{{p}}autorole on @Members', '{{p}} autorole off'],
      dirname: __dirname,
      enabled: true,
      guildOnly: true,
      aliases: ["ar"],
      memberPermissions: ["MANAGE_GUILD"],
      botPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
      nsfw: false,
      ownerOnly: false,
      args: true,
      cooldown: 5000
    });
  }

  async run(message, args, data) {

    const status = args[0];
    if (status !== "on" && status !== "off") {
      return message.channel.send('Please specify a valid value between`on` and`off`');
    }

    if (status === "on") {
      const role = await Resolvers.resolveRole({
        message,
        search: args.slice(1).join(" ")
      });
      if (!role) {
        return message.channel.send('Please specify a valid role!');
      }

      data.guild.plugins.autorole = {
        enabled: true,
        role: role.id
      };
      data.guild.markModified("plugins.autorole");
      await data.guild.save();

      message.channel.send(`Autorole enabled! New members will automatically receive the **${role.name}** role`);
    }

    if (status === "off") {

      if (!data.guild.plugins.autorole.enabled) {
        return message.channel.send(`**The autorole is already disabled.**\n\n:arrow_right_hook: *Send \`${data.guild.prefix}autorole on @YourRole\` to enable it again!*`);
      }

      data.guild.plugins.autorole = {
        enabled: false,
        role: null
      };
      data.guild.markModified("plugins.autorole");
      await data.guild.save();

      message.channel.send(`**Autorole disabled!**\n\n:arrow_right_hook: *Send \`${data.guild.prefix} configuration\` to see the updated configuration!*`);
    }
  }
}

module.exports = Autorole;