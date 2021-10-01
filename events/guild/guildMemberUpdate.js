const rcon = require("../../helpers/rcon");
module.exports = class {
  constructor(client) {
    this.client = client;
  }

  async run(oldMember, newMember) {
    const fRoleIDs = Object.keys(this.client.config.factorioRoles).map(
      (name) => this.client.config.factorioRoles[name].id
    );
    if (newMember.roles.cache.some((r) => fRoleIDs.includes(r.id))) {
      // Factorio role syncing
      const memberRoleIDs = newMember.roles.cache.map((role) => role.id);
      const authRoleIDs = fRoleIDs.filter((role) =>
        memberRoleIDs.includes(role)
      );
      let authRoles = [];
      Object.keys(this.client.config.factorioRoles).forEach((key) => {
        const role = this.client.config.factorioRoles[key];
        if (authRoleIDs.includes(role.id)) authRoles.push(role);
      });
      let user = await this.client.findOrCreateUser({ id: newMember.id });
      const roleNames = authRoles.map((role) => role.name);
      user.factorioRoles = roleNames;
      user.save(() => {});
    }
    if (oldMember.guild.id !== this.client.config.support?.id) return;
    if (oldMember.roles.cache.some((r) => r.name === "【💳】Donators")) return;
    if (newMember.roles.cache.some((r) => r.name === "【💳】Donators")) {
    }
  }
};
