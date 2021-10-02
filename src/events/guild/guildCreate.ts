import { Collection, Guild, Invite } from "discord.js";
import Comfy from "../../base/Comfy";

export default async (client: Comfy, guild: Guild) => {
  // auto guild leave for protection
  if (client.config.safeGuilds.length) {
    if (!client.config.safeGuilds.includes(guild.id)) {
      let guildInvites: Collection<string, Invite>;
      try {
        guildInvites = await guild.fetchInvites();
      } catch {}
      client.emergencylog(
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
};
