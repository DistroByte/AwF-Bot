const { prefix } = require("../../botconfig.json");
const { sendToServer } = require("../../functions");

module.exports = async (client, message) => {
  let args = message.content.slice(prefix.length).trim().split(/ +/g);
  let cmd = args.shift().toLowerCase();
  if (message.author.bot) return;

  let slap = client.emojis.cache.find((emoji) => emoji.name === "slap");
  if (message.content.includes("Jammy say hi"))
    return message.channel.send(":wave:");
  if (message.content.includes("Jammy work"))
    return message.channel.send("you coded me this way, your issue");
  if (message.content.includes("soon"))
    message.react(
      message.guild.emojis.cache.find((emoji) => emoji.name === "soontm")
    );
  if (message.content.includes("lenny"))
    return message.channel.send(`( ͡° ͜ʖ ͡°)`);
  if (message.content.includes("slap") && message.mentions) {
    message.delete();
    return message.channel.send(
      `${
        message.mentions.members.first() ||
        message.content.slice(message.content.indexOf("slap") + 5)
      } ${slap}`
    );
  }

  if (message.content.includes("<@")) {
    //check if the message that the bot reads has a mention of a user
    message.mentions.users.forEach((user) => {
      message.content = message.content.replace(
        /<@[\S.]*>/,
        "@" + user.username
      );
    });
  } else if (message.content.includes("<#")) {
    //check if the message includes a mention of a discord channel
    message.mentions.channels.forEach((channel) => {
      message.content = message.content.replace(
        /<#[\S.]*>/,
        "#" + channel.name
      );
    });
  }
  sendToServer(message, true); // send the message to corresponding server
  if (!message.content.startsWith(prefix)) return;
  let commandfile =
    client.commands.get(cmd) || client.commands.get(client.aliases.get(cmd));
  if (commandfile) commandfile.run(client, message, args);
};
