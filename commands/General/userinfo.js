const Command = require("../../base/Command.js"),
  Discord = require("discord.js"),
  fetch = require("node-fetch");

class Userinfo extends Command {

  constructor(client) {
    super(client, {
      name: "userinfo",
      description: "Shows user information!",
      usage: "(@user/userID)",
      examples: ["{{p}}userinfo\n{{p}}userinfo @DistroByte#0001\n{{p}}userinfo 180375991133143040"],
      dirname: __dirname,
      enabled: true,
      guildOnly: false,
      aliases: ["ui"],
      memberPermissions: [],
      botPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
      nsfw: false,
      ownerOnly: false,
      cooldown: 5000
    });
  }

  async run(message, args, data) {

    let displayPresence = true;

    const isID = !isNaN(args[0]);

    var user;
    if (!args[0]) {
      user = message.author;
    }
    if (message.mentions.users.first()) {
      user = message.mentions.users.first();
    }
    if (isID && !user) {
      user = this.client.users.cache.get(args[0]);
      if (!user) {
        user = await this.client.users.fetch(args[0], true).catch(() => { });
        displayPresence = false;
      }
    }

    if (!user) return message.channel.send(`No user on Discord has the \`${args[0]}\` ID!`);

    let member = null;
    if (message.guild) member = await message.guild.members.fetch(user).catch(() => { });

    const embed = new Discord.MessageEmbed()
      .setAuthor(user.tag, user.displayAvatarURL())
      .setThumbnail(user.displayAvatarURL({ dynamic: true }))
      .addField("Username", user.username, true)
      .addField("Discriminator", user.discriminator, true)
      .addField("Bot", (user.bot ? "Yes" : "No"), true)
      .addField("Account creation date", this.client.printDate(user.createdAt), true)
      .addField("Avatar", user.displayAvatarURL())
      .setColor(data.config.embed.color)
      .setFooter(data.config.embed.footer);

    if (displayPresence) {
      embed.addField("Game", (user.presence.activity ? user.presence.activity.name : "No game"), true)
        .addField("Status", `Status ${user.presence.status.toUpperCase()}`, true);
    }

    if (member) {
      embed.addField("Role", (member.roles.highest ? member.roles.highest : "No role"), true)
        .addField("Join date", this.client.printDate(member.joinedAt), true)
        .addField("Role colour", member.displayHexColor, true)
        .addField("Nickname", (member.nickname ? member.nickname : "No nickname"), true)
        .addField("Roles", (member.roles.size > 10 ? member.roles.cache.map((r) => r).slice(0, 9).join(", ") + " " + `and ${member.roles.cache.size - 10}` : (member.roles.cache.size < 1) ? "No roles" : member.roles.cache.map((r) => r).join(", ")))
    }

    if (user.bot && this.client.config.apiKeys.dbl && (this.client.config.apiKeys.dbl !== "")) {
      const res = await fetch("https://discordbots.org/api/bots/" + user.id, { headers: { "Authorization": this.client.config.apiKeys.dbl } });
      const data = await res.json();
      if (!data.error) {
        embed.addField("Description", data.shortdesc, true)
          .addField("Stats", `**${data.monthlyPoints} votes ([top.gg](https://top.gg))\n${data.server_count} servers\n${(data.shards || [0]).length}\nUsing ${data.lib || "Unknown"}`, true)
          .addField("Links", `${data.support ? `[Support](${data.support}) | ` : ""}${data.invite ? `[Invite](${data.invite}) | ` : ""}${data.github ? `[GitHub](${data.github}) | ` : ""}${data.website ? `[Website](${data.website})` : ""}`, true);
      }
    }

    message.channel.send(embed);
  }
}

module.exports = Userinfo;
