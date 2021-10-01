module.exports = class {
  constructor(client) {
    this.client = client;
  }

  async run(guild) {
    // auto guild leave for protection
    if (this.client.config.safeGuilds.length) {
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
    }
  }
};
