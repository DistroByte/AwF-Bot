import { DMChannel, Message } from "discord.js";
import Comfy from "../../base/Comfy";
import fifo from "../../helpers/fifo-handler";

export default async (client: Comfy, message: Message) => {

  if (message.author.bot) return;
  if (!message.channel.isText()) return

  if (message.guild && !message.member)
    await message.guild.members.fetch(message.author.id);

  if (message.content === "@someone" && message.guild) {
    return client.commands.get("someone").run({message, args: [], client});
  }

  const prefix = client.config.prefix;
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

  if (!cmd) return
  if (message.channel.type === "dm" || !message.guild) return;

  let neededPermissions = [];
  if (cmd.botPermissions) {
    if (!cmd.botPermissions.includes("EMBED_LINKS")) {
      cmd.botPermissions.push("EMBED_LINKS");
    }
    message.channel.type
    cmd.botPermissions.forEach((perm) => {
      if (message.channel.type === "dm") return // TODO: remove this if bug is fixed
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
  }

  neededPermissions = [];
  if (cmd.memberPermissions) {
    cmd.memberPermissions.forEach((perm) => {
      if (message.channel.type === "dm") return // TODO: remove this if bug is fixed
      if (!message.channel.permissionsFor(message.member).has(perm)) {
        neededPermissions.push(perm);
      }
    });
  }
  let customPermissions = [];
  if (cmd.customPermissions) {
    cmd.customPermissions?.forEach((permname) => {
      const perm = client.config.customPermissions.find(
        (p) => p.name === permname
      );
      if (!perm) return;
      if (!message.member.roles.cache.has(perm.roleid))
        customPermissions.push(perm);
    });
  }

  // custom command perms. if there are custom permissions, they take priority over normal perms
  if (customPermissions.length) {
    console.log(customPermissions, customPermissions.length)
    const neededRoleIds = cmd.customPermissions
      .map((permname) =>
        client.config.customPermissions.find(
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

  if (!message.channel.nsfw && cmd.nsfw) {
    return message.channel.send(
      "You must execute this command in a channel that allows NSFW!"
    );
  }

  if (!cmd.enabled) {
    return message.channel.send("This command is currently disabled!");
  }

  if (cmd.ownerOnly) {
    const guildUser = message.guild.member(message.author);
    if (!guildUser.roles.cache.get(client.config.adminroleid))
      return message.channel.send(
        "Only the owner of ComfyBot can run this commands!"
      );
  }

  client.logger(
    `${message.author.username} used command ${cmd.name} in ${
      message.guild ? message.guild.name : "DMs"
    } (${message.author.id}) | Content: ${cmd.name} ${args.join(" ")}`,
    "cmd"
  );


  try {
    cmd.run({message, args, client: client});
  } catch (e) {
    console.error(e);
    return message.channel.send(
      "Something went wrong... Please retry again later!"
    );
  }
}