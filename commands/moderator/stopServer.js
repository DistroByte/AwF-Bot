const fs = require('fs');
const { exec } = require('child_process');
const { absPath } = require('../../botconfig.json');
const { MessageEmbed } = require('discord.js');
const { bubbleSort, modifiedSort } = require('../../functions')

module.exports = {
    config: {
        name: 'stopServer',
        aliases: ['stopServer', 'stopS', 'stops'],
        usage: '<server name>',
        category: 'moderator',
        description: 'Start a server testing server',
        accessableby: 'Moderators'
    },
    run: async (client, message, args) => {
        let authRoles = message.member.roles.cache

        if (authRoles.some(r => r.name === 'Admin') || authRoles.some(r => r.name === 'Moderator') || authRoles.some(r => r.name === 'dev')) {
            if (!args[0]) { // no argument at all
                let choiceEmbed = new MessageEmbed()
                    .setTitle('Server Stop Choices')
                    .setDescription('Choices of a Factorio Server Stop. This shows **all** folders in the `servers` directory, some may not be Factorio server folders')
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
            } else {
                try { // see if priviliges are ok
                    exec('test -w .');
                } catch (e) {
                    console.log(`Insufficient permissions. Error: ${e}`);
                    return message.channel.send(`Insufficient permissions. Error: ${e}`);
                }

                try { // stop the server
                    //this wasn't finishing last time
                    let res = await new Promise((resolve, reject) => {
                        exec(`${absPath}/${args[0]}/factorio-init/factorio stop`, (error, stdout, stderr) => {
                            if (error) {
                                console.log(error.message)
                                reject(['error', error.message]);
                            }
                            if (stderr) {
                                console.log(stderr)
                                reject(['stderr', stderr]);
                            }
                            console.log(stdout)
                            resolve(stdout);
                        });
                    })
                    console.log(res);
                    message.channel.send(`out: ${res[0]}: ${res[1]}`);
                } catch (e) {
                    return message.channel.send(`61 server stop error: ${e}`);
                }

                return message.channel.send('Server stop success')
                    .then((m) => m.delete({ timeout: 5000, reason: 'tidying up' }));
            }
        }
    }
}