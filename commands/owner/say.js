module.exports = {
  config: {
    name: 'say',
    description: 'Sends a message that was inputted to a channel',
    usage: '',
    category: 'owner',
    accessableby: 'Owner',
    aliases: ['acc', 'announcement'],
  },
  run: async (client, message, args) => {
    if (!message.member.hasPermission(['MANAGE_MESSAGES', 'ADMINISTRATOR']))
      return message.channel.send("You can't use this command!");

    let argsresult;
    let mentionedChannel = message.mentions.channels.first();

    message.delete();
    if (mentionedChannel) {
      argsresult = args.slice(1).join(' ');
      mentionedChannel.send(argsresult);
    } else {
      argsresult = args.join(' ');
      message.channel.send(argsresult);
    }
  },
};
