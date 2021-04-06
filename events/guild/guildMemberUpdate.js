module.exports = class {

  constructor(client) {
    this.client = client;
  }

  async run(oldMember, newMember) {
    if (oldMember.guild.id !== this.client.config.support?.id) return;
    if (oldMember.roles.cache.some((r) => r.name === "【💳】Donators")) return;
    if (newMember.roles.cache.some((r) => r.name === "【💳】Donators")) { }
  }
};