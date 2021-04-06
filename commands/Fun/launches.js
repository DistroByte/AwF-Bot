const Command = require("../../base/Command"),
  { MessageEmbed } = require('discord.js'),
  fetch = require('node-fetch');

class Launches extends Command {
  constructor(client) {
    super(client, {
      name: "launches",
      description: "Fetches the next 3 space launches!",
      dirname: __dirname,
      enabled: true,
      guildOnly: false,
      aliases: [],
      memberPermissions: [],
      botPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
      nsfw: false,
      ownerOnly: false,
      args: false,
      cooldown: 3000
    });
  }

  async run(message, args, data) {
    const embed = new MessageEmbed()
      .setTitle("**Upcoming Launches, in order**")

    var url = "https://spacelaunchnow.me/api/3.3.0/launch/upcoming/?format=json";
    if (args[1] === "past") {
      url = "https://spacelaunchnow.me/api/3.3.0/launch/previous/?format=json";
    }

    var iteration = 1
    var number = 3
    if (args[0]) {
      number = args[0]
    }

    fetch(url)
      .then((res) => res.json())
      .then((res) => {
        var fieldValue = ""

        for (var s in res.results) {
          if (iteration > number) { break }

          var launch = res.results[s];
          var rocketName;
          if (!launch.rocket.configuration.name) {
            rocketName = "Unknown"
          } else {
            rocketName = launch.rocket.configuration.name
          }

          var agency;
          if (!launch.rocket.configuration.launch_service_provider) {
            agency = "Unknown"
          } else {
            agency = launch.rocket.configuration.launch_service_provider
          }

          var mission;
          if (!launch.mission) {
            mission = "Unknown"
          } else {
            mission = launch.mission.name
          }

          var site;
          if (!launch.pad.name) {
            site = "Unknown"
          } else {
            site = launch.pad.name
          }

          var date;
          if (!launch.net) {
            date = "Unknown"
          } else {
            date = new Date(launch.net)
            date = date.toString().slice(16, 21) + "- " + date.toString().slice(4, 11)
          }

          var status = launch.status.name

          var link;
          if (!launch.slug) {
            link = "unknown"
          } else {
            link = launch.slug
          }

          embed.addField(`**${rocketName}** - ${agency}`, `Mission name: ${mission}\nLaunch date: **${date}**\nLaunch site: ${site}`)
          iteration++
        }
        embed.setDescription(`See [here](https://spacelaunchnow.me/launch/upcoming/) for more info`)
        message.channel.send(embed)
      })
  }
}

module.exports = Launches;