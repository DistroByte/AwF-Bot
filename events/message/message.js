const xpCooldown = {},
  cmdCooldown = {},
  storage = require("storage-to-json"),
  caSend = new storage("computerAppsCorrect");
const fifo = require("../../helpers/fifo-handler.js");

module.exports = class {
  constructor(client) {
    this.client = client;
  }

  async run(message) {
    const data = {};

    if (message.author.bot) return;

    if (message.guild && !message.member)
      await message.guild.members.fetch(message.author.id);

    const client = this.client;
    data.config = client.config;

    if (message.guild) {
      const guild = await client.findOrCreateGuild({ id: message.guild.id });
      message.guild.data = data.guild = guild;
    }

    if (message.content.match(new RegExp(`^<@!?${client.user.id}>( |)$`))) {
      if (message.guild) {
        return message.channel.send(
          `Hello **${message.author.username}**, my prefix on this server is \`${data.guild.prefix}\`.Use \`${data.guild.prefix}help\` to get a list of the commands!`
        );
      } else {
        return message.channel.send(
          `Hello **${message.author.username}**, as you are currently in direct message you don't need to add a prefix before a command name.`
        );
      }
    }

    if (message.content === "@someone" && message.guild) {
      return client.commands.get("someone").run(message, null, data);
    }

    if (message.guild) {
      const memberData = await client.findOrCreateMember({
        id: message.author.id,
        guildID: message.guild.id,
      });
      data.memberData = memberData;
    }

    const userData = await client.findOrCreateUser({ id: message.author.id });
    data.userData = userData;

    if (message.guild) {
      await updateXp(message, data);

      let cacorrect = caSend.get_storage();
      if (message.guild.id === "759921793422458901") {
        for (var key in cacorrect) {
          var value = cacorrect[key];
          if (message.content.toLowerCase().includes(key)) {
            message.channel.send(value);
          }
        }
      }

      if (
        !message.channel
          .permissionsFor(message.member)
          .has("MANAGE_MESSAGES") &&
        !message.editedAt
      ) {
        const channelSlowmode = data.guild.slowmode.channels.find(
          (ch) => ch.id === message.channel.id
        );
        if (channelSlowmode) {
          const uSlowmode = data.guild.slowmode.users.find(
            (d) => d.id === message.author.id + message.channel.id
          );
          if (uSlowmode) {
            if (uSlowmode.time > Date.now()) {
              message.delete();
              const delay = message.convertTime(uSlowmode.time, "to", true);
              return message.author.send(
                `Channel ${message.channel.toString()} is in slowmode! Please wait ${delay} between each message!`
              );
            } else {
              uSlowmode.time = channelSlowmode.time + Date.now();
            }
          } else {
            data.guild.slowmode.users.push({
              id: message.author.id + message.channel.id,
              time: channelSlowmode.time + Date.now(),
            });
          }
          data.guild.markModified("slowmode.users");
          await data.guild.save();
        }
      }

      if (
        data.guild.plugins.automod.enabled &&
        !data.guild.plugins.automod.ignored.includes(message.channel.id)
      ) {
        if (
          /(discord\.(gg|io|me|li)\/.+|discordapp\.com\/invite\/.+)/i.test(
            message.content
          )
        ) {
          if (
            !message.channel
              .permissionsFor(message.member)
              .has("MANAGE_MESSAGES")
          ) {
            message.delete();
            message.author.send("```" + message.content + "```");
            return message.channel.send(
              "Your message was deleted because Discord invitations are not allowed on this server!"
            );
          }
        }
      }

      const afkReason = data.userData.afk;
      if (afkReason) {
        data.userData.afk = null;
        await data.userData.save();
        message.channel.send(
          `**${message.author.username}**, your AFK status has just been deleted!`
        );
      }

      message.mentions.users.forEach(async (u) => {
        const userData = await client.findOrCreateUser({ id: u.id });
        if (userData.afk) {
          message.channel.send(
            `**${u.tag}** is currently AFK, reason:\n\`\`\`${userData.afk}\`\`\``
          );
        }
      });
    }
    const prefix = this.client.config.prefix;
    if (!message.content.startsWith(prefix)) {
      fifo.sendToServer(message, true);
      return;
    }

    const args = message.content
      .slice(typeof prefix === "string" ? prefix.length : 0)
      .trim()
      .split(/ +/g);
    const command = args.shift().toLowerCase();
    const cmd =
      client.commands.get(command) ||
      client.commands.get(client.aliases.get(command));

    const customCommand = message.guild
      ? data.guild.customCommands.find((c) => c.name === command)
      : null;
    const customCommandAnswer = customCommand ? customCommand.answer : "";

    if (!cmd && !customCommandAnswer && message.guild) return;
    else if (!cmd && !customCommandAnswer && !message.guild) {
      return message.channel.send(
        `Hello **${message.author.username}**, as you are currently in direct message you don't need to add a prefix before a command name.`
      );
    }

    if (!customCommandAnswer) {
      if (cmd.conf.args && !customCommandAnswer && !args.length) {
        let reply = `Please provide some arguments, ${message.author}!`;
        if (cmd.help.usage) {
          reply += `\nThe proper usage would be: \`${prefix}${cmd.help.name} ${cmd.help.usage}\``;
        }
        return message.channel.send(reply);
      }
    }

    if (
      message.guild &&
      data.guild.ignoredChannels.includes(message.channel.id) &&
      !message.member.hasPermission("MANAGE_MESSAGES")
    ) {
      return message.author.send(
        `Commands are not allowed in ${message.channel.toString()}!`
      );
    }

    if (customCommandAnswer) {
      return message.channel.send(customCommandAnswer);
    }

    if (cmd.conf.guildOnly && !message.guild) {
      return message.channel.send(
        "This command is only available on a server!"
      );
    }

    if (message.guild) {
      let neededPermissions = [];
      if (!cmd.conf.botPermissions.includes("EMBED_LINKS")) {
        cmd.conf.botPermissions.push("EMBED_LINKS");
      }

      cmd.conf.botPermissions.forEach((perm) => {
        if (!message.channel.permissionsFor(message.guild.me).has(perm)) {
          neededPermissions.push(perm);
        }
      });

      if (neededPermissions.length > 0) {
        return message.channel.send(
          `I need the following permissions to execute this command: ${neededPermissions
            .map((p) => `\`${p}\``)
            .join(", ")}`
        );
      }

      neededPermissions = [];
      cmd.conf.memberPermissions.forEach((perm) => {
        if (!message.channel.permissionsFor(message.member).has(perm)) {
          neededPermissions.push(perm);
        }
      });
      let customPermissions = [];
      cmd.conf.customPermissions.forEach((permname) => {
        const perm = this.client.config.customPermissions.find(
          (p) => p.name === permname
        );
        if (!perm) return;
        if (!message.member.roles.cache.has(perm.roleid))
          customPermissions.push(perm);
      });

      // custom command perms. if there are custom permissions, they take priority over normal perms
      if (customPermissions.length) {
        const neededRoleIds = cmd.conf.customPermissions
          .map((permname) =>
            this.client.config.customPermissions.find(
              (p) => p.name === permname
            )
          )
          .filter((r) => r)
          .map((p) => p.roleid);
        const neededRoles = await Promise.all(
          neededRoleIds.map((roleid) => message.guild.roles.fetch(roleid))
        ).then((r) => r.filter((r) => r));
        return message.channel.send(
          `You need the following permissions to execute this command: ${neededPermissions
            .map((p) => `\`${p}\``)
            .join(", ")}. You can also have the following roles: \`${neededRoles
            .map((r) => r.name)
            .join("`, `")}\``
        );
      } else {
        const neededRoleIds = cmd.conf.customPermissions
          .map((permname) =>
            this.client.config.customPermissions.find(
              (p) => p.name === permname
            )
          )
          .filter((r) => r)
          .map((p) => p.roleid);
        const neededRoles = await Promise.all(
          neededRoleIds.map((roleid) => message.guild.roles.fetch(roleid))
        ).then((r) => r.filter((r) => r));
        if (
          customPermissions.length !== 0 &&
          cmd.conf.customPermissions.length &&
          neededPermissions.length > 0
        ) {
          return message.channel.send(
            `You need the following permissions to execute this command: ${neededPermissions
              .map((p) => `\`${p}\``)
              .join(
                ", "
              )}. You can also have the following roles: \`${neededRoles
              .map((r) => r.name)
              .join("`, `")}\``
          );
        }
      }

      if (
        !message.channel
          .permissionsFor(message.member)
          .has("MENTION_EVERYONE") &&
        (message.content.includes("@everyone") ||
          message.content.includes("@here"))
      ) {
        return message.channel.send(
          "You are not allowed to mention `@everyone` or `@here` in commands"
        );
      }

      if (!message.channel.nsfw && cmd.conf.nsfw) {
        return message.channel.send(
          "You must execute this command in a channel that allows NSFW!"
        );
      }
    }

    if (!cmd.conf.enabled) {
      return message.channel.send("This command is currently disabled!");
    }

    if (cmd.conf.ownerOnly) {
      const guildUser = message.guild.member(message.author);
      if (!guildUser.roles.cache.get(client.config.adminRoleId))
        return message.channel.send(
          "Only the owner of ComfyBot can run this commands!"
        );
    }

    let uCooldown = cmdCooldown[message.author.id];
    if (!uCooldown) {
      cmdCooldown[message.author.id] = {};
      uCooldown = cmdCooldown[message.author.id];
    }

    const time = uCooldown[cmd.help.name] || 0;
    if (time && time > Date.now()) {
      return message.channel.send(
        `You must wait **${Math.ceil(
          (time - Date.now()) / 1000
        )}** second(s) to be able to run this command again!`
      );
    }

    cmdCooldown[message.author.id][cmd.help.name] =
      Date.now() + cmd.conf.cooldown;

    client.logger.log(
      `${message.author.username} used command ${cmd.help.name} in ${
        message.guild ? message.guild.name : "DMs"
      } (${message.author.id}) | Content: ${cmd.help.name} ${args.join(" ")}`,
      "cmd"
    );

    const log = new this.client.logs({
      commandName: cmd.help.name,
      author: {
        username: message.author.username,
        discriminator: message.author.discriminator,
        id: message.author.id,
      },
      guild: {
        name: message.guild ? message.guild.name : "dm",
        id: message.guild ? message.guild.id : "dm",
      },
    });
    log.save();

    try {
      cmd.run(message, args, data);
      if (
        cmd.help.category === "Moderation" &&
        data.guild.autoDeleteModCommands
      ) {
        message.delete();
      }
    } catch (e) {
      console.error(e);
      return message.channel.send(
        "Something went wrong... Please retry again later!"
      );
    }
  }
};

async function updateXp(msg, data) {
  const xp = parseInt(data.memberData.xp);

  const isInCooldown = xpCooldown[msg.author.id];
  if (isInCooldown) {
    if (isInCooldown > Date.now()) return;
  }

  const toWait = Date.now() + 30000;
  xpCooldown[msg.author.id] = toWait;

  const xpToAdd = Number(Math.floor(Math.random() * 15 + 15));
  const newXp = xp + xpToAdd;

  data.memberData.xp = newXp;
  await data.memberData.save();
}
