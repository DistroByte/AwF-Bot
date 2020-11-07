const fs = require('fs');
const Discord = require('discord.js')
const { searchOneDB, bubbleSort } = require('../../functions')

module.exports = {
    config: {
        name: 'fStatsServer',
        aliases: ['fstatss', 'statss'],
        usage: '<server name> <"server"/"death"> [player]',
        category: 'factorio',
        description: 'View some statistics of the server',
        accessableby: 'Members'
    },
    run: async (client, message, args) => {
        if (!args[0]) { // no argument at all
            let choiceEmbed = new Discord.MessageEmbed()
                .setTitle('Server Statistics')
                .setDescription('Display the statistics of a Factorio server.')
                .setColor('GREEN')
                .setAuthor(`${message.guild.me.displayName} Help`, message.guild.iconURL)
                .setThumbnail(client.user.displayAvatarURL())
                .setFooter(
                    `© ${message.guild.me.displayName} | Developed by DistroByte & oof2win2 | Total Commands: ${client.commands.size}`,
                    client.user.displayAvatarURL()
                )
            let dirData = fs.readdirSync('../servers/')
            dirData = bubbleSort(dirData);
            dirData.forEach(dir => {
                if (fs.statSync('../servers/' + dir).isDirectory()) choiceEmbed.addField(`\`${dir}\``, '\u200B'); //check if it is a directory and if yes add it to the embed
            });
            return message.channel.send(choiceEmbed)
        }
        if (!args[1]) { // if the server name is provided but no 2nd argument, searches for generic server data
            let statsEmbed = new Discord.MessageEmbed()
                .setTitle(`Server Statistics of \`${args[0]}\``)
                .setDescription(`Some statistics of the ${args[0]} Factorio server. Please check use to see other statistics`)
                .setColor('GREEN')
                .setAuthor(`${message.guild.me.displayName} Help`, message.guild.iconURL)
                .setThumbnail(client.user.displayAvatarURL())
                .setFooter(
                    `© ${message.guild.me.displayName} | Developed by DistroByte & oof2win2 | Total Commands: ${client.commands.size}`,
                    client.user.displayAvatarURL()
                )
            let rockets = await searchOneDB(message.channel.name, "stats", { rocketLaunches: { $exists: true } });
            if (rockets == null)
                rockets = 0
            else 
                rockets = rockets.rocketLaunches
            statsEmbed.addField('Rockets launched', rockets)
            let research = await searchOneDB(message.channel.name, "stats", { completedResearch: { $exists: true } });
            research = research.completedResearch;
            let maxLevelResearch = ["str", 0];
            Object.keys(research).forEach(function (key) {
                if (parseInt(research[key]) > maxLevelResearch[1]) {
                    maxLevelResearch[0] = key;
                    maxLevelResearch[1] = parseInt(research[key]);
                }
            });
            statsEmbed.addField('Highest level research', `\`${maxLevelResearch[0]}\` at level \`${maxLevelResearch[1]}\``)
            return message.channel.send(statsEmbed);
        }
        if (!args[3]) { // if supplied with both the username of player & deaths
            if (args[1] != "deaths") return message.channel.send('invalid parameter. please see help')
            if (!args[2]) return message.channel.send('Please supply with player name to view deaths!');
            let statsEmbed = new Discord.MessageEmbed() 
                .setTitle(`Death Statistics of \`${args[2]}\` on server \`${args[0]}\``)
                .setDescription(`The death statistics of player \`${args[2]}\` from server  \`${args[0]}\``)
                .setColor('GREEN')
                .setAuthor(`${message.guild.me.displayName} Help`, message.guild.iconURL)
                .setThumbnail(client.user.displayAvatarURL())
                .setFooter(
                    `© ${message.guild.me.displayName} | Developed by DistroByte & oof2win2 | Total Commands: ${client.commands.size}`,
                    client.user.displayAvatarURL()
                )
            let player = await searchOneDB(args[0], "deaths", { player: `${args[2]}` });
            if (player == null) return message.channel.send(`Player \`${args[2]}\` not found on server \`${args[0]}\``)
            let maxDeaths = ["str", 0];
            Object.keys(player.deaths).forEach(function (key) {
                if (parseInt(player.deaths[key]) > maxDeaths[1]) {
                    maxDeaths[0] = key;
                    maxDeaths[1] = parseInt(player.deaths[key]);
                }
            });
            statsEmbed.addField('Highest amount of deaths', `\`${maxDeaths[1]}\` due to cause \`${maxDeaths[0]}\``)
            delete player.deaths[maxDeaths[0]]; //delete the already added maxDeaths from the rest of the deaths to prevent it being there twice

            // to sort deaths by most deaths
            var sortable = [];
            for (var death in player.deaths) {
                sortable.push([death, player.deaths[death]]);
            }
            sortable.sort(function (a, b) {
                return b[1] - a[1];
            });
            player.deaths = undefined;
            player.deaths = {}
            sortable.forEach(function (item) {
                player.deaths[item[0]] = item[1]
            })

            let i = 1
            for (var key of Object.keys(player.deaths)) {
                if (i == 24) break; // discord embed limit of max fields, we already added one
                statsEmbed.addField(`Death cause: \`${key}\``, `Number of deaths from cause: ${player.deaths[key]}`)
                i++;
            }

            return message.channel.send(statsEmbed);
        }
    }
}