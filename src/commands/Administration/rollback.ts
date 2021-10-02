import { Message, MessageEmbed } from "discord.js";
import { Command } from "../../base/Command.js";
import {
  sortModifiedDate,
  runShellCommand,
  getConfirmationMessage,
  createPagedEmbed,
} from "../../helpers/functions";
import fs from "fs";
import servers from "../../servers";

const Rollback: Command<Message> = {
  name: "rollback",
  description: "Restore a Factorio save",
  usage: "(channel) (save name)",
  category: "Administration",
  aliases: ["restoresave"],
  examples: ["{{p}}rollback #awf-regular _autosave43"],
  dirname: __dirname,
  enabled: true,
  guildOnly: false,
  memberPermissions: ["ADMINISTRATOR"],
  botPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
  nsfw: false,
  ownerOnly: false,
  customPermissions: ["MANAGE_SERVER"],
  run: async ({ client, message, args }) => {
    if (!args[0]) return message.channel.send("Ping a server!");
    const serverid =
      message.mentions.channels.first()?.id ||
      (await client.channels.fetch(args[0]).then((c) => c?.id));
    const server = servers.find((server) => server.discordid === serverid);
    if (!server)
      return message.channel.send(`\`${args[0]}\` is an invalid server!`);

    if (!args[1]) {
      // no save provided
      const savefiles = sortModifiedDate(
        fs
          .readdirSync(`${client.config.serverpath}/${server.path}/saves`)
          .map(
            (path) => `${client.config.serverpath}/${server.path}/saves/${path}`
          )
      ).filter((save) => save.path.endsWith(".zip"));
      const embed = new MessageEmbed()
        .setAuthor(message.guild.name, message.guild.iconURL())
        .setColor(client.config.embed.color)
        .setFooter(client.config.embed.footer);

      const content = savefiles.map((savefile) => {
        return {
          name: `\`${savefile.path.slice(
            savefile.path.lastIndexOf("/") + 1,
            -".zip".length
          )}\``,
          value: `<t:${Math.round(new Date(savefile.mtime).valueOf() / 1000)}>`,
          inline: false,
        };
      });

      createPagedEmbed(content, message, null, embed);
    } else {
      // specific save provided
      let save;
      try {
        save = fs.statSync(
          `${client.config.serverpath}/${server.path}/saves/${args[1]}.zip`
        );
      } catch (e) {
        return message.channel.send(`${args[1]} is an invalid save!`);
      }
      const confirm = await getConfirmationMessage(
        message,
        `Are you sure you want to reset the save to \`${
          args[1]
        }\` from ${new Date(save.mtime).toISOString()}?`
      );
      if (!confirm) return message.channel.send("Rollback cancelled");

      const command = [
        `${client.config.serverpath}/${server.path}/factorio-init/factorio stop`,
        `${client.config.serverpath}/${server.path}/factorio-init/factorio load-save ${args[1]}`,
        `${client.config.serverpath}/${server.path}/factorio-init/factorio start`,
      ].join(" && ");

      // return
      await runShellCommand(command).catch((e) => {
        return message.channel.send(`Error restoring: \`${e}\``);
      });
      setTimeout(() => {
        runShellCommand(
          `${client.config.serverpath}/${server.path}/factorio-init/factorio status`
        )
          .then((res) => {
            message.channel.send(res);
          })
          .catch((e) => message.channel.send(`Error statusing: ${e}`));
      }, 5000);
    }
  },
};

export default Rollback;
