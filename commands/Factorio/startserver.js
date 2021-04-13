const { MessageEmbed } = require("discord.js");
const Command = require("../../base/Command.js");
const serverJS = require("../../servers")
const { serverpath } = require("../../config")
const { bubbleSort, getServerFromChannelInput, runShellCommand } = require("../../helpers/functions")
const fs = require("fs")
const childprocess = require("child_process")

class Linkme extends Command {
  constructor(client) {
    super(client, {
      name: "startserver",
      description: "Start a Factorio server",
      usage: "<server channel ping>",
      examples: ["{{p}}startserver #awf-regular"],
      dirname: __dirname,
      enabled: true,
      guildOnly: false,
      aliases: [],
      memberPermissions: ["MANAGE_MEMBERS"],
      botPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
      nsfw: false,
      ownerOnly: false,
      cooldown: 5000
    });
  }

  async run(message, args) {
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
          message.guild.iconURL
        )
      let dirData = serverJS.map((server) => {
        return { dir: `${serverpath}/${server.path}`, server: server }
      })
      dirData = bubbleSort(dirData);
      dirData.forEach((dir) => {
        if (fs.statSync(dir).isDirectory())
          choiceEmbed.addField(`\`${dir}\``, "\u200B"); //check if it is a directory and if yes add it to the embed
      });
      return message.channel.send(choiceEmbed);
    } else {
      let serverFolder;
      if (message.mentions.channels.first())
        serverFolder = getServerFromChannelInput(message.mentions.channels.first().id).path;
      else
        serverFolder = args[0];
      let process = childprocess.spawn(`./factorio-init/factorio`, ['start'], { detatched: true, cwd: `${serverpath}/${serverFolder}`})
      // TODO: fix this. factorio-init is tied to this process so i somehow have to stop kill the connection but let factorio-init continue
      // process.on('message', () => {
      //   console.log(process.connected)
      // })
      process.unref()
      setTimeout(() => {
        console.log(process.connected)
        runShellCommand(`${serverpath}/${serverFolder}/factorio-init/factorio status`)
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