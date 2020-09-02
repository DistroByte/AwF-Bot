const { prefix } = require('../../botconfig.json');

module.exports = async (client, message) => {
  let args = message.content.slice(prefix.length).trim().split(/ +/g);
  let cmd = args.shift().toLowerCase();

  if (message.author.bot) return;
  if (!message.content.startsWith(prefix)) return;
  let commandfile =
    client.commands.get(cmd) || client.commands.get(client.aliases.get(cmd));
  if (commandfile) commandfile.run(client, message, args);
};