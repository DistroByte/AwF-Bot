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
      .map((connection) => connection.server.name);
    const serversWithoutScenario = rcon.rconConnections
      .filter((connection) => !connection.hasScenario)
      .filter((connection) => connection.server.hidden === false)
      .map((connection) => connection.server.name);

    const scenarioOutputProm = serversWithScenario.map((name) =>
      rcon.rconCommand(
        "/interface t = {}; for _, player in ipairs(game.connected_players) do t[player.name] = Roles.get_player_highest_role(player).name end; rcon.print(game.table_to_json(t))",
        name
      )
    );
    const withoutScenarioOutputProm = serversWithoutScenario.map(
      (name) => rcon.rconCommand("/p o", name)
    );
    const scenarioOutput = await Promise.all(scenarioOutputProm);
    const withoutScenarioOutput = await Promise.all(withoutScenarioOutputProm);

    scenarioOutput.forEach((response) => {
      if (!response.resp)
        return embed.addField(
			response.resp != false ? response.server.discordname : response.identifier,
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
			response.resp != false ? response.server.discordname : response.identifier,
          "Server is unreachable"
        );
      const players = response.resp
        .split("\n")
        .slice(1)
        .map((line) => line.slice(0, line.indexOf(" (online)")));
      embed.addField(
        response.server.discordname,
        players.join("\n") || "Nobody is online"
      );
    });
    return message.channel.send({
      embeds: [embed],
    });
  },
};

export default OnlinePlayers;
