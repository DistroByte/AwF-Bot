const { Guild, Message, MessageEmbed } = require('discord.js');
const config = require('../config');

Message.prototype.convertTime = function (time, type, noPrefix) {
  return this.client.convertTime(time, type, noPrefix, (this.guild && this.guild.data) ? this.guild.data.language : null);
};