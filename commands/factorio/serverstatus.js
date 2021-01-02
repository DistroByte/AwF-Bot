const Discord = require("discord.js");
const {
  getServerList,
  bubbleSort,
  runShellCommand,
  getServerFromChannelInput,
} = require("../../functions");
const { absPath } = require("../../botconfig.json");

module.exports = {
  config: {
    name: "serverstatus",
    aliases: [],
    usage: "<serverName>",
    category: "factorio",
    description: "Check the availability of a Factorio server (running or not)",
    accessableby: "Members",
  },
  run: async (client, message, args) => {
    if (!args[0]) {
      let choiceEmbed = new Discord.MessageEmbed()
        .setTitle("Server Availability Choices")
        .setDescription("Choices of a server to status")
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
        choiceEmbed.addField(`\`${dir}\``, "\u200B"); //check if it is a directory and if yes add it to the embed
      });
      return message.channel.send(choiceEmbed);
    }
    if (!args[1]) {
      if (message.mentions.channels.first()) {
        let server = getServerFromChannelInput(message.mentions.channels.first().id);
        runShellCommand(`${absPath}/${server.serverFolderName}/factorio-init/factorio status`)
          .catch((e) => {
            return message.channel.send(`Error statusing: \`${e}\``);
          })
          .then((out) => {
            return message.channel.send(`Status of server <#${server.discordChannelID}>: \`${out}\``);
          })
      }
      else {
        runShellCommand(`${absPath}/${args[0]}/factorio-init/factorio status`)
          .catch((e) => {
            return message.channel.send(`Error statusing: \`${e}\``);
          })
          .then((out) => {
            return message.channel.send(`Status of server \`${args[0]}\`: \`${out}\``);
          });
      }
    }
  },
};
