const Discord = require('discord.js')
const { rconCommand } = require('../../functions')
const serverJson = require('../../servers.json')

module.exports = {
    config: {
        name: 'onlineplayers',
        aliases: [],
        usage: '',
        category: 'factorio',
        description: 'View online players across all servers',
        accessableby: 'Members'
    },
    run: async (client, message, args) => {
        let onlinePlayers = new Discord.MessageEmbed()
            .setTitle(`Online Players`)
            .setDescription(`Online players on Factorio servers`)
            .setColor('GREEN')
            .setAuthor(`${message.guild.me.displayName} Help`, message.guild.iconURL)
            .setThumbnail(client.user.displayAvatarURL())
            .setFooter(
                `© ${message.guild.me.displayName} | Developed by DistroByte & oof2win2 | Total Commands: ${client.commands.size}`,
                client.user.displayAvatarURL()
            )
        let servers = []
        Object.keys(serverJson).forEach(element => {
            if (serverJson[element].serverFolderName != '') //if server isn't hidden
                servers.push([serverJson[element].name, serverJson[element].discordChannelName]);
        })

        let promiseArray = servers.map((server) => {
            return new Promise((resolve) => {
                rconCommand(message, '/p o', server[0])
                    .then((res) => {
                        if (!res[1].startsWith('error')) {
                            resolve(onlinePlayers.addField(server[1], res[0], inline = true));
                        } else {
                            resolve(onlinePlayers.addField(server[1], 'Error getting players online. Server may be offline', inline = true))
                        }
                    })
                    .catch((e) => {
                        resolve(onlinePlayers.addField(server[1], e, inline = true))
                    })
            })
        })
        Promise.all(promiseArray).then((serverPlayers) => {
            return message.channel.send(onlinePlayers);
        });
        
    }
}
