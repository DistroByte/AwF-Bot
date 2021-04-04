module.exports = class {
  constructor(client) {
    this.client = client;
  }

  async run() {
    const client = this.client;
    client.logger.log(`${client.user.tag} is online, serving ${client.users.cache.size} users in ${client.guilds.cache.size} servers.`, 'ready');

    // const checkUnmutes = require('../helpers/checkUnmutes.js');
    // checkUnmutes.init(client);

    const checkReminds = require('../../helpers/checkReminds.js');
    checkReminds.init(client);

    // const discordbotsorg = require('../helpers/discordbots.org.js');
    // discordbotsorg.init(client);

    if (client.config.dashboard && client.config.dashboard.enabled) {
      client.dashboard.load(client);
    }

    let activities = [
      `${client.guilds.cache.size} servers!`,
      `${client.channels.cache.size} channels!`,
      `${client.users.cache.size} users!`,
    ],
      i = 0;
    setInterval(() => {
      client.user.setActivity(`${activities[i++ % activities.length]}`, { type: 'WATCHING' })
    }, 15000);
  }
}