const Command = require('../../base/Command.js'),
  Discord = require('discord.js');

class Help extends Command {
  constructor(client) {
    super(client, {
      name: 'help',
      description: 'Show commands list or specific command help',
      usage: '(command)',
      examples: ['{{p}}help', '{{p}}help ping'],
      dirname: __dirname,
      enabled: true,
      guildOnly: false,
      aliases: ['h', 'commands'],
      memberPermissions: [],
      botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
      nsfw: false,
      ownerOnly: false,
      cooldown: 5000
    });
  }

  async run(message, args, data) {
    const prefix = message.guild ? data.guild.prefix : ''
    if (args[0]) {
      const isCustom = (data.guild.customCommands ? data.guild.customCommands.find((c) => c.name === args[0]) : false);

      const cmd = this.client.commands.get(args[0]) || this.client.commands.get(this.client.aliases.get(args[0]));
      if (!cmd && isCustom) {
        return message.channel.send('A custom command doesn\'t have help page');
      } else if (!cmd) {
        return message.channel.send(`\`${args[0]}\` is not a valid command\nType \`${data.guild.prefix}help\` to see a list of available commands!`);
      }

      const description = cmd.help.description ? cmd.help.description : 'No description';
      const usage = cmd.help.usage ? '```\n' + prefix + cmd.help.name + " " + cmd.help.usage + '\n```' : prefix + cmd.help.name;
      const examples = cmd.help.examples ? `\`\`\`${cmd.help.examples.join('\n').replace(/\{\{p\}\}/g, prefix)}\`\`\`` : `\`\`\`${prefix}${cmd.help.name}\`\`\``;

      // Creates the help embed
      const groupEmbed = new Discord.MessageEmbed()
        .setAuthor(`${prefix}${cmd.help.name} help`)
        .addField('Description', description)
        .addField('Usage', usage)
        .addField('Examples', examples)
        .addField('Aliases', cmd.help.aliases.length > 0
          ? cmd.help.aliases.map(a => `\`${a}\``).join(',')
          : 'No aliases'
        )
        .addField('Member permissions requried', cmd.conf.memberPermissions.length > 0
          ? cmd.conf.memberPermissions.map((p) => '`' + p + '`').join('\n')
          : 'No specific permission is required to execute this command'
        )
        .setColor(this.client.config.embed.color)
        .setFooter(this.client.config.embed.footer);

      // and send the embed in the current channel
      return message.channel.send(groupEmbed);
    }

    const categories = [];
    const commands = this.client.commands;

    commands.forEach((command) => {
      if (!categories.includes(command.help.category)) {
        if (command.help.category === 'Owner' && message.author.id !== this.client.config.owner.id) {
          return;
        }
        categories.push(command.help.category);
      }
    });

    const emojis = this.client.emotes;

    const embed = new Discord.MessageEmbed()
      .setDescription(`● To get help on a specific command type\`${prefix}help <command>\`!`)
      .setColor(data.config.embed.color)
      .setFooter(data.config.embed.footer);
    categories.sort().forEach((cat) => {
      const tCommands = commands.filter((cmd) => cmd.help.category === cat);
      embed.addField(cat + ' - (' + tCommands.size + ')', tCommands.map((cmd) => '`' + cmd.help.name + '`').join(', '));
    });
    if (message.guild) {
      if (data.guild.customCommands.length > 0) {
        embed.addField(message.guild.name + ' | Custom commands - (' + data.guild.customCommands.length + ')', data.guild.customCommands.map((cmd) => `\`${cmd.name}\``).join(', '));
      }
    }

    embed.addField('\u200B', `[Dashboard](https://dashboard.dbyte.xyz) ● [Donate](https://www.patreon.com/distrobyte) ● [Invite](${this.client.config.inviteURL}) ● [Support](${this.client.config.supportURL}) ● [Github](https://www.github,com/DistroByte)`);
    embed.setAuthor(`${this.client.user.username} | Commands`, this.client.user.displayAvatarURL());
    return message.channel.send(embed);
  }
}

module.exports = Help;
