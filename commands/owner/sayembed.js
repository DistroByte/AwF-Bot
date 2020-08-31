const { MessageEmbed } = require('discord.js');

module.exports = {
  config: {
    name: 'sayembed',
    description: 'Sends a message that was inputted to a channel as an embed',
    usage: '<message>',
    category: 'owner',
    accessableby: 'owner',
    aliases: ['acce', 'announcemente', 'saye'],
  },
  run: async (client, message, args) => {
    if (!message.member.hasPermission(['MANAGE_MESSAGES', 'ADMINISTRATOR']))
      return message.channel.send("You can't use this command!");

    let argsresult;
    let mChannel = message.mentions.channels.first();

    message.delete();
    if (mChannel) {
      argsresult = args.slice(1).join(' ');
      const embed = new MessageEmbed()
        .setDescription(argsresult)
        .setColor('GREEN');
      mChannel.send(embed);
    } else {
      argsresult = args.join(' ');
      const embed = new MessageEmbed()
        .setDescription(argsresult)
        .setColor('GREEN');
      message.channel.send(embed);
    }
  },
};
