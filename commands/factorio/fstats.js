const fs = require('fs');
const Discord = require('discord.js')
const { searchOneDB } = require('../../functions')

module.exports = {
    config: {
        name: 'fStatsServer',
        aliases: ['fstatss', 'statss'],
        usage: '<server name>',
        category: 'factorio',
        description: 'View some statistics of the server',
        accessableby: 'Members'
    },
    run: async (client, message, args) => {
        let authRoles = message.member.roles.cache
        if (authRoles.some(r => r.name === 'Admin') || authRoles.some(r => r.name === 'Moderator') || authRoles.some(r => r.name === 'dev')) {
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
            if (!args[1]) { // if the server name is provided but no 2nd argument
                let statsEmbed = new Discord.MessageEmbed()
                    .setTitle(`${args[0]} Server Statistics`)
                    .setDescription(`Some statistics of the ${args[0]} Factorio server`)
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
        }
    }
}