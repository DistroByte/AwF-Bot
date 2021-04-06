const Command = require("../../base/Command.js"),
  ms = require("ms");

class Remindme extends Command {

  constructor(client) {
    super(client, {
      name: "remindme",
      description: "Add a new personal reminder",
      usage: '[time] [message]',
      examples: ['{{p}}remindme 24h Work command', '{{p}}remindme 3m Check on the pasta!'],
      dirname: __dirname,
      enabled: true,
      guildOnly: false,
      aliases: ["reminder", "remind"],
      memberPermissions: [],
      botPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
      nsfw: false,
      ownerOnly: false
    });
  }

  async run(message, args, data) {

    const time = args[0];
    if (!time || isNaN(ms(time))) {
      return message.channel.send('You must enter a valid time! Available units: `s`, `m`, `h` or`d`');
    }

    const msg = args.slice(1).join(" ");
    if (!msg) {
      return message.channel.send('You must enter a message!');
    }

    const rData = {
      message: msg,
      createdAt: Date.now(),
      sendAt: Date.now() + ms(time)
    };

    if (!data.userData.reminds) {
      data.userData.reminds = [];
    }

    data.userData.reminds.push(rData);
    data.userData.markModified("reminds");
    data.userData.save();
    this.client.databaseCache.usersReminds.set(message.author.id, data.userData);

    // Send success message
    message.channel.send(`Reminder set! I will send you \`${msg}\` in \`${time}\``);
  }

}

module.exports = Remindme;