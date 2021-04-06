const Command = require("../../base/Command");

class Lockdown extends Command {
  constructor(client) {
    super(client, {
      name: "lockdown",
      description: "Toggles allowing users to send messages in any channel, locks down the server!",
      dirname: __dirname,
      enabled: false,
      guildOnly: false,
      aliases: [],
      memberPermissions: [],
      botPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
      nsfw: false,
      ownerOnly: false,
      args: false,
      cooldown: 3000
    });
  }

  async run(message, args, data) {
    const lockdownState = data.guild.lockdown;
    const everyone = message.guild.roles.everyone

    try {
      message.guild.channels.cache.forEach(c => {
        if (c.permissionOverwrites.get('762797547114070096').allow.toArray().includes("SEND_MESSAGES"))
          c.updateOverwrite(everyone, { SEND_MESSAGES: lockdownState ? null : false })
      })
    } catch (err) {
      console.log(err);
    }

    data.guild.lockdown = !lockdownState;
    data.guild.save()

    if (data.guild.lockdown) {
      message.channel.send("**Success!**\nServer in lockdown")
    } else {
      message.channel.send("**Success!**\nServer no longer in lockdown")
    }
  }
}

module.exports = Lockdown;