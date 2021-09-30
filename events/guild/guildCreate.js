module.exports = class {
  constructor(client) {
    this.client = client;
  }

  async run(guild) {
    // auto guild leave for protection
    if (this.client.config.safeGuilds.length) {
      if (!this.client.config.safeGuilds.includes(guild.id)) {
        this.client.emergencylog(
          `Bot has been invited to guild ID \`${guild.id}\``
        );
        guild.leave();
      }
    }
  }
};
