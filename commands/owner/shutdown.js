const { ownerid } = require('../../botconfig.json');

module.exports = {
  config: {
    name: 'shutdown',
    description: 'Shuts down the bot!',
    usage: '',
    category: 'owner',
    accessableby: 'owner',
    aliases: ['botstop'],
  },
  run: async (client, message, args) => {
    if (message.author.id != ownerid)
      return message.channel.send("You're not the bot the owner!");

    try {
      await message.channel.send('Bot is shutting down...');
      process.exit();
    } catch (e) {
      message.channel.send(`ERROR: ${e.message}`);
    }
  },
};
