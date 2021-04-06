const Discord = require('discord.js');

module.exports = class {

  constructor(client) {
    this.client = client;
  }

  async run(guild) {

    if (this.client.config.proMode) {
      if ((!this.client.config.proUsers.includes(guild.ownerID) || this.guilds.filter((g) => g.ownerID === guild.ownerID) > 1) && guild.ownerID !== this.client.config.owner.id) {
        this.client.logger.log(guild.ownerID + ' tried to invite ComfyBot on its server.');
        return guild.leave();
      }
    }

    guild = await guild.fetch();

    const messageOptions = {};
    const thanksEmbed = new Discord.MessageEmbed()
      .setAuthor('Thank you for adding me to your guild!')
      .setDescription('To configure me, type `' + this.client.config.prefix + 'help` and look at the administration commands!')
      .setColor(this.client.config.embed.color)
      .setFooter(this.client.config.embed.footer)
      .setTimestamp();
    messageOptions.embed = thanksEmbed;

    guild.owner.send(messageOptions).catch(() => { });

    const text = `I joined **${guild.name}**, with **${guild.members.cache.filter((m) => !m.user.bot).size}** members (and ${guild.members.cache.filter((m) => m.user.bot).size} bots)`;

    // Sends log embed in the logs channel
    const logsEmbed = new Discord.MessageEmbed()
      .setAuthor(guild.name, guild.iconURL())
      .setColor('#32CD32')
      .setDescription(text);
    this.client.channels.cache.get(this.client.config.support.logs).send(logsEmbed);
    this.client.logger.log(`Guild added! ${guild.name}`, "log");
  }
};