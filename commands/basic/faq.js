const { MessageEmbed } = require('discord.js');
const { prefix } = require('../../botconfig.json');
const { readdirSync } = require('fs');
const { stripIndents } = require('common-tags');
const { longMessages } = require('../../longMessages.js');

module.exports = {
  config: {
    name: 'faq',
    aliases: ['f', 'faq'],
    usage: '(command)',
    category: 'faq',
    description: 'This is a command for the Frequently Asked Questions (FAQ)',
    accessableby: 'Members',
  },
  run: async (client, message, args) => {
    const embed = new MessageEmbed()
      .setColor('GREEN')
      .setAuthor(`${message.guild.me.displayName} Help`, message.guild.iconURL)
      .setThumbnail(client.user.displayAvatarURL());

    if (!args[0]) { //if the argument is empty
      embed.setDescription(
        `These are the avaliable FAQ pages for ${message.guild.me.displayName}\nThe bot prefix is: **${prefix}**`
      );
      embed.setFooter(
        `© ${message.guild.me.displayName} | Developed by DistroByte & oof2win2 | Total Commands: ${client.commands.size}`,
        client.user.displayAvatarURL()
      );
      embed.addField(
        'FAQ pages:',
        string => `\`${Object.getOwnPropertyNames(longMessages)}\``).join(' ');
      );
      return message.channel.send(embed);
    } else {
      let command = args[0].toLowerCase()
      if (!command)
        return message.channel.send(
          embed
            .setTitle('Invalid Command.')
            .setDescription(
              `Do \`${prefix}help\` for the list of the commands.`
            )
        );

      longMessage = longMessages[command]; //the embed from longMessages.js
      longMessage.footer = (`© ${message.guild.me.displayName} | Developed by DistroByte & oof2win2`,
      client.user.displayAvatarURL());

      return message.channel.send({ embed: longMessage});
    }
  },
};
