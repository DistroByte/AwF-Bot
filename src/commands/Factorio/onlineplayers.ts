import { Message, MessageEmbed } from "discord.js";
import { Command } from "../../base/Command";
import rcon from "../../helpers/rcon";

const OnlinePlayers: Command<Message> = {
  name: "onlineplayers",
  description: "Get online players on all servers",
  usage: "",
  category: "Factorio",
  dirname: __dirname,
  enabled: true,
  guildOnly: false,
  aliases: ["po", "playersonline"],
  memberPermissions: [],
  botPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
  nsfw: false,
  ownerOnly: false,
  run: async ({ client, message }) => {
    let embed = new MessageEmbed()
      .setAuthor(message.guild.name, message.guild.iconURL())
      .setColor(client.config.embed.color)
      .setFooter(client.config.embed.footer);

    const serversWithScenario = rcon.rconConnections
      .filter((connection) => connection.hasScenario)
	  .filter((connection) => connection.server.hidden === false)
      .map((connection) => connection.server.discordname);
    const serversWithoutScenario = rcon.rconConnections
      .filter((connection) => !connection.hasScenario)
	  .filter((connection) => connection.server.hidden === false)
      .map((connection) => connection.server.discordname);

    const scenarioOutputProm = serversWithScenario.map((discordname) =>
      rcon.rconCommand(
        "/interface t = {}; for _, player in ipairs(game.connected_players) do t[player.name] = Roles.get_player_highest_role(player).name end; rcon.print(game.table_to_json(t))",
        discordname
      )
    );
    const withoutScenarioOutputProm = serversWithoutScenario.map(
      (discordname) => rcon.rconCommand("/p o", discordname)
    );
    const scenarioOutput = await Promise.all(scenarioOutputProm);
    const withoutScenarioOutput = await Promise.all(withoutScenarioOutputProm);

    scenarioOutput.forEach((response) => {
      if (!response.resp || typeof response.resp !== "string")
        return embed.addField(
          response.server.discordname,
          "Server is unreachable"
        );
      const playerRoles = JSON.parse(
        response.resp.slice(0, response.resp.indexOf("\n"))
      );
      if (Object.keys(playerRoles).length)
        embed.addField(
          response.server.discordname,
          Object.keys(playerRoles)
            .map((playername) => `${playername}: ${playerRoles[playername]}`)
            .join("\n")
        );
      else embed.addField(response.server.discordname, "Nobody is online");
    });
    withoutScenarioOutput.forEach((response) => {
      if (!response.resp || typeof response.resp !== "string")
        return embed.addField(
          response.server.discordname,
          "Server is unreachable"
        );
      embed.addField(response.server.discordname, response.resp);
    });
    return message.channel.send(embed);
  },
};

export default OnlinePlayers;