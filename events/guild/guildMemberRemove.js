const stringCleaner = require('@sindresorhus/slugify');
// const Canvas = require('ca')
const Discord = require('discord.js');
const { resolve } = require('path');

module.exports = class {

  constructor(client) {
    this.client = client;
  }

  async run(member) {

    member.guild.fetch().then(async (guild) => {

      const guildData = await this.client.findOrCreateGuild({ id: guild.id });
      member.guild.data = guildData;

      // Check if goodbye message is enabled
      if (guildData.plugins.goodbye.enabled) {
        const channel = guild.channels.cache.get(guildData.plugins.goodbye.channel);
        if (channel) {
          const message = guildData.plugins.goodbye.message
            .replace(/{user}/g, member.user.tag)
            .replace(/{server}/g, guild.name)
            .replace(/{membercount}/g, guild.memberCount);
          channel.send(message);
        }
      }
    });
  }
};
