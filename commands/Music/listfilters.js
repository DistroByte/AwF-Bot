const Command = require("../../base/Command");

class ListFilters extends Command {
  constructor(client) {
    super(client, {
      name: "listfilters",
      description: "Lists all the currently available filters",
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

    const filtersStatuses = [[], []];

    this.client.filters.forEach((filterName) => {
      const array = filtersStatuses[0].length > filtersStatuses[1].length ? filtersStatuses[1] : filtersStatuses[0];
      array.push(filterName.charAt(0).toUpperCase() + filterName.slice(1) + " : " + (this.client.player.getQueue(message).filters[filterName] ? this.client.emotes?.success : this.client.emotes?.off));
    });

    message.channel.send({
      embed: {
        color: 'ORANGE',
        fields: [
          { name: 'Filters', value: filtersStatuses[0].join('\n'), inline: true },
          { name: '** **', value: filtersStatuses[1].join('\n'), inline: true },
        ],
        timestamp: new Date(),
        description: `List of all filters enabled or disabled.\nUse \`${data.guild.prefix}filter\` to add a filter to a song.`,
      },
    });
  }
}

module.exports = ListFilters;