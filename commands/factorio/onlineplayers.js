const Discord = require('discord.js')
const { rconCommand } = require('../../functions')
const serverJson = require('../../servers.json')

module.exports = {
    config: {
        name: 'onlineplayers',
        aliases: ['fstatss', 'statss'],
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
            if (servers[element].serverFolderName != '') //if server isn't hidden
                servers.push([serverJson[element].name, serverJson[element].discordChannelName]);
        })
        servers.forEach((server) => {
            rconCommand(message, '/p o', server[0])
                .then((res) => {
                    if (!res[1].startsWith('error')) {
                        onlinePlayers.addField(server[1], res[0], inline = true)
                    } else {
                        onlinePlayers.addField(server[1], error, inline = true)
                    }
                    if (onlinePlayers.fields.size == serverJson.size)
                        return message.channel.send(onlinePlayers);
                })
                .catch((e) => {
                    onlinePlayers.addField(server[1], e, inline = true)
                })
        })   
    }
}