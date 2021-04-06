const Command = require("../../base/Command.js"),
  Discord = require("discord.js");

class Configuration extends Command {

  constructor(client) {
    super(client, {
      name: "configuration",
      description: "Shows the server configuration!",
      dirname: __dirname,
      enabled: true,
      guildOnly: true,
      aliases: ["conf", "config"],
      memberPermissions: ["MANAGE_GUILD"],
      botPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
      nsfw: false,
      ownerOnly: false,
      cooldown: 3000
    });
  }

  async run(message, args, data) {

    const guildData = data.guild;

    const embed = new Discord.MessageEmbed()
      .setAuthor(message.guild.name, message.guild.iconURL())
      .setColor(this.client.config.embed.color)
      .setFooter(this.client.config.embed.footer);

    // Guild prefix
    embed.addField('Server prefix', `\`\`\`${guildData.prefix}\`\`\``);

    // Ignored channels
    embed.addField('Ignored channel(s)',
      (guildData.ignoredChannels.length > 0) ?
        guildData.ignoredChannels.map((ch) => `<#${ch}>`).join(", ")
        : "No ignored channels"
    );

    // Autorole plugin
    embed.addField('Autorole',
      (guildData.plugins.autorole.enabled) ?
        `Role: <@&${guildData.plugins.autorole.role}>`
        : 'Autorole disabled'
    );

    // Welcome plugin
    embed.addField('Welcome',
      (guildData.plugins.welcome.enabled) ?
        `Channel: <#${guildData.plugins.welcome.channel}>`
        : "Welcome messages disabled"
    );

    // Goodbye plugin
    embed.addField("Goodbye",
      (guildData.plugins.goodbye.enabled) ?
        `Channel: <#${guildData.plugins.goodbye.channelID}>`
        : 'Goodbye messages disabled'
    );

    // Special channels
    const modlogs = guildData.plugins.modlogs ? `Moderation logs: <#${guildData.plugins.modlogs}>` : `Moderation logs: *Not set*`;
    const suggestions = guildData.plugins.suggestions ? `Suggestions: <#${guildData.plugins.suggestions}>` : `Suggestions: *Not set*`;
    const reports = guildData.plugins.reports ? `Reports: <#${guildData.plugins.reports}>` : `Reports: *Not set*`;
    embed.addField("Special channels", `${modlogs}\n${suggestions}\n${reports}`);

    // Auto sanctions
    const warnsCountKick = guildData.plugins.warnsSanctions.kick ? `Kick :  After **${guildData.plugins.warnsSanctions.kick}** warnings` : "Kick: Not defined";
    const warnsCountBan = guildData.plugins.warnsSanctions.ban ? `Ban :  After **${guildData.plugins.warnsSanctions.ban}** warnings` : "Ban: Not defined";
    embed.addField(`Automatic sanctions`, `${warnsCountKick}\n${warnsCountBan}`);

    // Automod plugin
    embed.addField("Auto-moderation:", guildData.plugins.automod.enabled ? `Auto-moderation enabled.\n*Ignored channels: ${guildData.plugins.automod.ignored.map((ch) => `<#${ch}>`)}*` : "Auto-moderation disabled");

    // Auto-delete mod commands
    embed.addField("Auto delete mod commands", !message.guild.autoDeleteModCommands ? "Automatic moderation commands deletion enabled" : "Automatic moderation commands deletion disabled");

    // Dashboard link
    embed.addField(`Edit your configuration:`, `[Click here to go on the dashboard!](${this.client.config.supportURL})`);

    message.channel.send(embed);
  }

}

module.exports = Configuration;
