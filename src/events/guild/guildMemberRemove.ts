import { GuildMember } from "discord.js";
import Comfy from "../../base/Comfy";
import rcon from "../../helpers/rcon";

export default async (
  client: Comfy,
  member: GuildMember
) => {
  const user = await client.findOrCreateUser({ id: member.id });
  
  // if the user is not linked just delete them immediately
  if (!user.factorioName) {
    await client.usersData.deleteOne({ id: member.id });
    return
  }

  // if the user is linked, remove them from the whitelist

  await client.removePlayerFromWhitelist(user.factorioName);

  // delete the user from the database
  await client.usersData.deleteOne({ id: member.id });  
};
