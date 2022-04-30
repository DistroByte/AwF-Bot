import { Message, MessageEmbed } from "discord.js";
import { Command } from "../../base/Command.js";
import serverJS from "../../servers";
import config from "../../config";
import { bubbleSort, runShellCommand } from "../../helpers/functions";
import fs from "fs";
import childprocess from "child_process";
const { serverpath } = config;

const Startserver: Command<Message> = {
  name: "startserver",
  description: "Start a Factorio server",
  usage: "[#channel]",
  category: "Administration",
  examples: ["{{p}}startserver #awf-regular"],
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
          "Choices of a Factorio Server Start. This shows **all** folders in the `servers` directory, some may not be Factorio server folders"
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
      let serverFolder = serverJS.find(
        (server) => server.discordid === message.mentions.channels.first().id
      )?.path;
      if (!serverFolder) return message.reply("No server corresponds to that!");

      let process = childprocess.spawn(`./factorio-init/factorio`, ["start"], {
        cwd: `${serverpath}/${serverFolder}`,
        detached: true,
      });

      // TODO: fix this. factorio-init is tied to this process so i somehow have to stop kill the connection but let factorio-init continue
      // process.on('message', () => {
      //   console.log(process.connected)
      // })
      process.unref();
      setTimeout(() => {
        // console.log(process.connected)
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
export default Startserver;
