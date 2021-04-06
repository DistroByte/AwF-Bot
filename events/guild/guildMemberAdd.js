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

      const memberData = await this.client.findOrCreateMember({ id: member.id, guildID: guild.id });
      if (memberData.mute.muted && memberData.mute.endDate > Date.now()) {
        guild.channels.cache.forEach((channel) => {
          channel.updateOverwrite(member.id, {
            SEND_MESSAGES: false,
            ADD_REACTIONS: false,
            CONNECT: false
          }).catch(() => { });
        });
      }

      if (guildData.plugins.autorole.enabled) {
        member.roles.add(guildData.plugins.autorole.role).catch(() => { });
      }

      if (guildData.plugins.welcome.enabled) {
        const channel = member.guild.channels.cache.get(guildData.plugins.welcome.channel);
        if (channel) {
          const message = guildData.plugins.welcome.message
            .replace(/{user}/g, member)
            .replace(/{server}/g, guild.name)
            .replace(/{membercount}/g, guild.memberCount);
          channel.send(message);
        }
      }
    });
  }
}
