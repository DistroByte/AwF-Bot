import { GuildMember } from "discord.js";
import { userInfo } from "os";
import Comfy from "../../base/Comfy";
import rcon from "../../helpers/rcon";

export default async (
  client: Comfy,
  _oldMember: GuildMember,
  newMember: GuildMember
) => {
  const user = await client.findOrCreateUser({ id: newMember.id });
  const factorioRoleIDs = Object.keys(client.config.factorioRoles).map(
    (name) => client.config.factorioRoles[name].id
  );
  console.log(
    _oldMember.roles.cache.map((role) => role.id),
    newMember.roles.cache.map((role) => role.id)
  );
  if (
    user.factorioName &&
    newMember.roles.cache.some((r) => factorioRoleIDs.includes(r.id))
  ) {
    const memberRoleIDs = newMember.roles.cache.map((role) => role.id);
    const shouldHaveRoleIDs = factorioRoleIDs.filter((r) =>
      memberRoleIDs.includes(r)
    );
    const factorioRoles: string[] = [];

    const rolesToUnassign: string[] = [];

    Object.keys(client.config.factorioRoles).map((name) => {
      const role = client.config.factorioRoles[name];
      console.log(role);
      if (shouldHaveRoleIDs.includes(role.id)) factorioRoles.push(role.name);
    });
    user.factorioRoles.forEach((role) => {
      if (!factorioRoles.includes(role)) {
        console.log(role);
        rolesToUnassign.push(role);
      }
    });
    console.log(rolesToUnassign, factorioRoles);
    user.factorioRoles = factorioRoles;

    if (rolesToUnassign.length) {
      rcon.rconCommandAll(
        `/interface Roles.unassign_player('${
          user.factorioName
        }', {'${rolesToUnassign.join("', '")}'}, "JammyBot")`
      );
    }
    factorioRoles.forEach((role) => {
      rcon.rconCommandAll(
        `/interface Roles.assign_player('${user.factorioName}', '${role}', "JammyBot")`
      );
    });
  }
};
