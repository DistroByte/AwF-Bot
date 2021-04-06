const Command = require("../../base/Command.js");

class Clear extends Command {

  constructor(client) {
    super(client, {
      name: "clear",
      description: "Quickly delete multiple messages!",
      usage: "[number of messages] (@user)",
      examples: ["{{p}} clear 10", "{ {p} } clear 10 @DistroByte#0001"],
      dirname: __dirname,
      enabled: true,
      guildOnly: true,
      aliases: ["clear", "bulkdelete", "purge"],
      memberPermissions: ["MANAGE_MESSAGES"],
      botPermissions: ["SEND_MESSAGES", "EMBED_LINKS", "MANAGE_MESSAGES"],
      nsfw: false,
      ownerOnly: false,
      cooldown: 3000
    });
  }

  async run(message, args) {

    if (args[0] === "all") {
      message.channel.send("All the channel messages will be deleted! To confirm type `-confirm`");
      await message.channel.awaitMessages((m) => (m.author.id === message.author.id) && (m.content === "-confirm"), {
        max: 1,
        time: 20000,
        errors: ["time"]
      }).catch(() => {
        return message.channel.send("Error: Time's up!");
      });
      const position = message.channel.position;
      const newChannel = await message.channel.clone();
      await message.channel.delete();
      newChannel.setPosition(position);
      return newChannel.send("Channel cleared!");
    }

    let amount = args[0];
    if (!amount || isNaN(amount) || parseInt(amount) < 1) {
      return message.channel.send("You must specify a number of messages to delete!");
    }

    await message.delete();

    const user = message.mentions.users.first();

    let messages = await message.channel.messages.fetch({ limit: 100 });
    messages = messages.array();
    if (user) {
      messages = messages.filter((m) => m.author.id === user.id);
    }
    if (messages.length > amount) {
      messages.length = parseInt(amount, 10);
    }
    messages = messages.filter((m) => !m.pinned);
    amount++;

    message.channel.bulkDelete(messages, true);

    let toDelete = null;

    if (user) {
      toDelete = await message.channel.send(`**${--amount}** messages of **${user.tag}** were deleted!`)
    } else {
      toDelete = await message.channel.send(`**${--amount}** were messages deleted!`)
    }

    setTimeout(function () {
      toDelete.delete();
    }, 2000);
  }
}

module.exports = Clear;
