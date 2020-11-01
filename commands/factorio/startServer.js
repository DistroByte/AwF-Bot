const fs = require('fs');
const child = require('child_process');
const { absPath } = require('../../botconfig.json');
const { MessageEmbed } = require('discord.js');
const { bubbleSort, modifiedSort } = require('../../functions')

module.exports = {
    config: {
        name: 'startServer',
        aliases: ['startS', 'starts'],
        usage: '<server name>',
        category: 'factorio',
        description: 'Start a server testing server',
        accessableby: 'Moderators'
    },
    run: async (client, message, args) => {
        let authRoles = message.member.roles.cache;
        if (authRoles.some(r => r.name === 'Admin') || authRoles.some(r => r.name === 'Moderator') || authRoles.some(r => r.name === 'dev')) {
            if (!args[0]) { // no argument at all
                let choiceEmbed = new MessageEmbed()
                    .setTitle('Server Rollback Choices')
                    .setDescription('Choices of a Factorio Server Rollback. This shows **all** folders in the `servers` directory, some may not be Factorio server folders')
                    .setColor('GREEN')
                    .setAuthor(`${message.guild.me.displayName} Help`, message.guild.iconURL)
                    .setThumbnail(client.user.displayAvatarURL())
                    .setFooter(
                        `© ${message.guild.me.displayName} | Developed by DistroByte & oof2win2 | Total Commands: ${client.commands.size}`,
                        client.user.displayAvatarURL()
                    );
                let dirData = fs.readdirSync('../servers/');
                dirData = bubbleSort(dirData);
                dirData.forEach(dir => {
                    if (fs.statSync('../servers/' + dir).isDirectory())
                        choiceEmbed.addField(`\`${dir}\``, '\u200B'); //check if it is a directory and if yes add it to the embed
                });
                return message.channel.send(choiceEmbed);
            } else {
                try {
                    let a = child.exec(`${absPath}/test/factorio-init/factorio start`);
                } catch (e) {
                    return console.log(e);
                }

                return message.channel.send(`Started server ${args[0]}`)
                    .then((m) => m.delete({ timeout: 5000, reason: 'tidying up' }));
            }
        }
    }
}