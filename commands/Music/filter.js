const Command = require("../../base/Command");

class Filter extends Command {
  constructor(client) {
    super(client, {
      name: "filter",
      description: "Applys a filter to the music",
      usage: "[filter name]",
      examples: ["{{p}}filter 8D", "{{p}}filter pulsator"],
      dirname: __dirname,
      enabled: true,
      guildOnly: false,
      aliases: [],
      memberPermissions: [],
      botPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
      nsfw: false,
      ownerOnly: false,
      cooldown: 3000
    });
  }

  async run(message, args, data) {
    if (!message.member.voice.channel) return message.channel.send(`${this.client.emotes?.error} - You're not in a voice channel!`);

    if (message.guild.me.voice.channel && message.member.voice.channel.id !== message.guild.me.voice.channel.id) return message.channel.send(`${this.client.emotes?.error} - You are not in the same voice channel!`);

    if (!this.client.player.getQueue(message)) return message.channel.send(`${this.client.emotes?.error} - No music currently playing!`);

    if (!args[0]) return message.channel.send(`${this.client.emotes?.error} - Please specify a valid filter to enable or disable!`);

    const filterToUpdate = this.client.filters.find((x) => x.toLowerCase() === args[0].toLowerCase());

    if (!filterToUpdate) return message.channel.send(`${this.client.emotes?.error} - This filter doesn't exist, try for example (8D, vibrato, pulsator, etc)!`);

    const filtersUpdated = {};

    filtersUpdated[filterToUpdate] = this.client.player.getQueue(message).filters[filterToUpdate] ? false : true;

    this.client.player.setFilters(message, filtersUpdated);

    if (filtersUpdated[filterToUpdate]) message.channel.send(`${this.client.emotes?.music} - I'm **adding** the filter to the music, please wait. Note: the longer the music is, the longer this will take.`);
    else message.channel.send(`${this.client.emotes?.music} - I'm **disabling** the filter on the music, please wait. Note: the longer the music is playing, the longer this will take.`);
  }
}

module.exports = Filter;