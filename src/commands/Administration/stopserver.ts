import { Message, MessageEmbed } from "discord.js";
import { Command } from "../../base/Command.js";
import serverJS from "../../servers";
import config from "../../config";
import {
  bubbleSort,
  getServerFromChannelInput,
  runShellCommand,
} from "../../helpers/functions";
import fs from "fs";
const { serverpath } = config;

const Stopserver: Command<Message> = {
  name: "stopserver",
  description: "Stop a Factorio server",
  category: "Administration",
  usage: "[#channel]",
  examples: ["{{p}}stopserver #awf-regular"],
  dirname: __dirname,
  enabled: true,
  guildOnly: false,
  aliases: [],
  memberPermissions: ["MANAGE_GUILD"],
  botPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
  nsfw: false,
  ownerOnly: false,
  customPermissions: ["MANAGE_SERVER"],
  run: async ({ message, args }) => {
    if (!args[0]) {
      // no argument at all
      let choiceEmbed = new MessageEmbed()
        .setTitle("Server Stop Choices")
        .setDescription(
          "Choices of a Factorio Server Stop. This shows **all** folders in the `servers` directory, some may not be Factorio server folders"
        )
        .setColor("GREEN")
        .setAuthor(
          `${message.guild.me.displayName} Help`,
          message.guild.iconURL()
        );
      let dirData = serverJS.map((server) => {
        return { dir: `${serverpath}/${server.path}`, server: server };
      });
      dirData = bubbleSort(dirData);
      dirData.forEach((dir) => {
        if (fs.statSync(dir.dir).isDirectory())
          choiceEmbed.addField(`\`${dir}\``, "\u200B"); //check if it is a directory and if yes add it to the embed
      });
      return message.channel.send({ embeds: [choiceEmbed] });
    } else {
      let serverFolder;
      if (message.mentions.channels.first())
        serverFolder = getServerFromChannelInput(
          message.mentions.channels.first().id
        ).path;
      else serverFolder = args[0];
      console.log(serverFolder);
      runShellCommand(
        `${serverpath}/${serverFolder}/factorio-init/factorio stop`
      ).catch((e) => {
        return message.channel.send(`Error stopping: \`${e}\``);
      });

      setTimeout(() => {
        runShellCommand(
          `${serverpath}/${serverFolder}/factorio-init/factorio status`
        )
          .catch((e) => {
            return message.channel.send(`Error statusing: \`${e}\``);
          })
          .then((out) => {
            return message.channel.send(`Server status: \`${out}\``);
          });
      }, 5000);
    }
  },
};

export default Stopserver;
