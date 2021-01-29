const fs = require("fs");
const child = require("child_process");
const { absPath } = require("../../botconfig.json");
const { MessageEmbed } = require("discord.js");
const {
  bubbleSort,
  getServerList,
  runShellCommand,
  getServerFromChannelInput,
} = require("../../functions");

module.exports = {
  config: {
    name: "startserver",
    aliases: ["starts"],
    usage: "<server name>",
    category: "moderator",
    description: "Start a server testing server",
    accessableby: "Moderators",
  },
  run: async (client, message, args) => {
    let authRoles = message.member.roles.cache;
    if (
      !authRoles.some((r) => ["Admin", "Moderator", "dev"].includes(r.name))
    ) {
      // if user is not Admin/Moderator/dev
      return message.channel.send(
        "You don't have enough priviliges to run this command!"
      );
    }
    if (!args[0]) {
      // no argument at all
      let choiceEmbed = new MessageEmbed()
        .setTitle("Server Rollback Choices")
        .setDescription(
          "Choices of a Factorio Server Rollback. This shows **all** folders in the `servers` directory, some may not be Factorio server folders"
        )
        .setColor("GREEN")
        .setAuthor(
          `${message.guild.me.displayName} Help`,
          message.guild.iconURL
        )
        .setThumbnail(client.user.displayAvatarURL())
        .setFooter(
          `© ${message.guild.me.displayName} | Developed by DistroByte & oof2win2 | Total Commands: ${client.commands.size}`,
          client.user.displayAvatarURL()
        );
      let dirData = getServerList();
      dirData = bubbleSort(dirData);
      dirData.forEach((dir) => {
        if (fs.statSync("../servers/" + dir).isDirectory())
          choiceEmbed.addField(`\`${dir}\``, "\u200B"); //check if it is a directory and if yes add it to the embed
      });
      return message.channel.send(choiceEmbed);
    } else {
      let serverFolder;
      if (message.mentions.channels.first())
        serverFolder = getServerFromChannelInput(message.mentions.channels.first().id).serverFolderName;
      else
        serverFolder = args[0];
      runShellCommand(
        `${absPath}/${serverFolder}/factorio-init/factorio start`
      ).catch((e) => {
        return message.channel.send(`Error starting: \`${e}\``);
      });

      setTimeout(() => {
        runShellCommand(`${absPath}/${serverFolder}/factorio-init/factorio status`)
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
