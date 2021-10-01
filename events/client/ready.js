module.exports = class {
  constructor(client) {
    this.client = client;
  }

  async run() {
    const client = this.client;
    client.logger.log(
      `${client.user.tag} is online, serving ${client.users.cache.size} users in ${client.guilds.cache.size} servers.`,
      "ready"
    );

    // const checkUnmutes = require('../helpers/checkUnmutes.js');
    // checkUnmutes.init(client);

    const checkReminds = require("../../helpers/checkReminds.js");
    checkReminds.init(client);

    // const discordbotsorg = require('../helpers/discordbots.org.js');
    // discordbotsorg.init(client);

    if (client.config.dashboard && client.config.dashboard.enabled) {
      client.dashboard.load(client);
    }

    // auto guild leave for protection
    if (this.client.config.safeGuilds.length) {
      this.client.guilds.cache.forEach(async (guild) => {
        if (!this.client.config.safeGuilds.includes(guild.id)) {
          let guildInvites;
          try {
            guildInvites = await guild.fetchInvites();
          } catch {}
          this.client.emergencylog(
            `Bot has been invited to guild ID ${guild.name} (\`${
              guild.id
            }\`) Invites: ${
              guildInvites
                ? guildInvites.map((invite) => invite.toString()).join(", ") ||
                  "No invites"
                : "No permissions to fetch invites"
            }`
          );
          guild.leave();
        }
      });
    }

    let activities = [
        `${client.guilds.cache.size} servers!`,
        `${client.channels.cache.size} channels!`,
        `${client.users.cache.size} users!`,
      ],
      i = 0;
    setInterval(() => {
      client.user.setActivity(`${activities[i++ % activities.length]}`, {
        type: "WATCHING",
      });
    }, 15000);
  }
};
