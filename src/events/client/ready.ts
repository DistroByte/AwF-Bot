import Comfy from "../../base/Comfy";

export default async (client: Comfy) => {
  client.logger(
    `${client.user.tag} is online, serving ${client.users.cache.size} users in ${client.guilds.cache.size} servers.`,
    "ready"
  );

  // auto guild leave for protection
  if (client.config.safeGuilds.length) {
    client.guilds.cache.forEach(async (guild) => {
      if (!client.config.safeGuilds.includes(guild.id)) {
        let guildInvites;
        try {
          guildInvites = await guild.invites.fetch();
        } catch {}
        client.emergencylog(
          `Bot has been invited to guild ID ${guild.name} (\`${
            guild.id
          }\`) Invites: ${
            guildInvites
              ? guildInvites.map((invite) => invite.url).join(", ") ||
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
};
