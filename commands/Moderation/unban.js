const Command = require("../../base/Command.js");

class Unban extends Command {

  constructor(client) {
    super(client, {
      name: "unban",
      description: "Unban the user from the server!",
      usage: "[userID/user#0000]",
      examples: ["{{p}}unban 422820341791064085", "{{p}}unban DistroByte#0001"],
      dirname: __dirname,
      enabled: true,
      guildOnly: true,
      aliases: ["deban", "déban"],
      memberPermissions: ["BAN_MEMBERS"],
      botPermissions: ["SEND_MESSAGES", "EMBED_LINKS", "BAN_MEMBERS"],
      nsfw: false,
      ownerOnly: false,
      cooldown: 3000
    });
  }

  async run(message, args) {

    let user = null;

    if (!args[0]) {
      return message.channel.send("Please specify the ID of the member you wish to unban!");
    }

    // Check if the arg is an ID or a username
    const isId = !isNaN(args[0]);

    if (isId) {
      // Try to find a user with that ID
      await this.client.users.fetch(args[0]).then((u) => {
        // if a user was found
        user = u;
      }).catch(() => { });
    } else if (!isId) {
      const arr = args[0].split("#");
      if (arr.length < 2) {
        return message.channel.send(`No user on Discord has the ID \`${args[0]}\`!`);
      }
      user = this.client.users.filter((u) => u.username === arr[0]).find((u) => u.discriminator === arr[1]);
    }

    if (!user) {
      return message.error(`No user on Discord has the ID \`${args[0]}\`!`);
    }

    // check if the user is banned
    const banned = await message.guild.fetchBans();
    if (!banned.some((e) => e.user.id === user.id)) {
      return message.channel.send(`**${user.tag}** is not banned!`);
    }

    // Unban user
    message.guild.members.unban(user).catch(() => { });

    // Send a success message in the current channel
    message.channel.send(`**${user.tag}** has just been unbanned from **${message.guild.name}**!`);
  }
}

module.exports = Unban;