import { Message, MessageEmbed } from "discord.js";
import { Command } from "../../base/Command.js";
import rcon from "../../helpers/rcon.js";

const Linkme: Command<Message> = {
  name: "linkme",
  description: "Link your Factorio and Discord accounts!",
  usage: "[linking id]",
  category: "Factorio",
  examples: ["{{p}}linkme 334957"],
  dirname: __dirname,
  enabled: true,
  guildOnly: false,
  aliases: [],
  memberPermissions: [],
  botPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
  nsfw: false,
  ownerOnly: false,
  run: async ({ client, message, args }) => {
    if (!args[0])
      return message.channel.send(
        "No linking code supplied! Get one from in-game"
      );
    const linkID = client.cache.linkingCache.get(`${args[0]}`);
    if (!linkID || typeof linkID !== "string")
      return message.channel.send(
        `Key ${args[0]} is invalid or expired. Keys should be in the format \`123456\``
      );
    client.cache.linkingCache.del(`${args[0]}`);
    let embed = new MessageEmbed()
      .setAuthor(message.guild.name, message.guild.iconURL())
      .setColor(client.config.embed.color)
      .setFooter(client.config.embed.footer);
    embed.addFields(
      { name: "Factorio name", value: linkID },
      { name: "Discord user", value: message.author }
    );
    embed.setDescription(
      "You have chosen to link youself. React with ✅ to confirm, ❌ to cancel. Will time out in 90s"
    );

    const confirm = await message.channel.send(embed);
    confirm.react("✅");
    confirm.react("❌");
    const reactionFilter = (reaction, user) => user.id == message.author.id;
    let reactions;
    try {
      reactions = await confirm.awaitReactions(reactionFilter, {
        max: 1,
        time: 120000,
        errors: ["time"],
      });
    } catch {
      return message.channel.send("Timed out.");
    }
    let reaction = reactions.first();
    if (reaction.emoji.name === "❌")
      return message.channel.send("Linking cancelled");
    try {
      let user = await client.findOrCreateUser({
        id: message.author.id,
      });
      user.factorioName = linkID;
      if (!user.factorioRoles) user.factorioRoles = [];
      user.factorioRoles.push("Member");
      user.save();
      message.channel.send("You have been successfully linked");

      // this may be a bit unnecessary to send it to all servers but it's easier than to
      // figure out from which server the linking process was initiated
      const serversWithScenario = rcon.rconConnections
        .filter((connection) => connection.hasScenario)
        .map((connection) => connection.server.discordname);
      serversWithScenario.map((discordname) =>
        rcon.rconCommand(
          `/interface Roles.assign_player("${linkID}", "Member", "${client.user.username}")`,
          discordname
        )
      );
    } catch (error) {
      console.error(error);
      return message.channel.send("Error linking. Please check logs.");
    }
  },
};

export default Linkme;