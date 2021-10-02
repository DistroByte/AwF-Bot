const { MessageEmbed } = require("discord.js");
const Command = require("../../base/Command.js");
const serverJS = require("../../servers");
const { serverpath } = require("../../config");
const {
  bubbleSort,
  getServerFromChannelInput,
  runShellCommand,
} = require("../../helpers/functions");
const fs = require("fs");

class Linkme extends Command {
  constructor(client) {
    super(client, {
      name: "stopserver",
      description: "Stop a Factorio server",
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
      cooldown: 5000,
      customPermissions: ["MANAGE_SERVER"],
    });
  }

  async run(message, args) {
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
          message.guild.iconURL
        );
      let dirData = serverJS.map((server) => {
        return { dir: `${serverpath}/${server.path}`, server: server };
      });
      dirData = bubbleSort(dirData);
      dirData.forEach((dir) => {
        if (fs.statSync(dir).isDirectory())
          choiceEmbed.addField(`\`${dir}\``, "\u200B"); //check if it is a directory and if yes add it to the embed
      });
      return message.channel.send(choiceEmbed);
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
  }
}

module.exports = Linkme;
