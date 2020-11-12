const { bubbleSort, sortModifiedDate } = require('../../functions')
const fs = require('fs');
const { exec } = require("child_process")
const { absPath } = require('../../botconfig.json');
const Discord = require('discord.js')
const { getServerList } = require('../../functions')

module.exports = {
  config: {
    name: 'restoresave',
    aliases: ['restore', 'getbackup'],
    usage: '<save name>',
    category: 'factorio',
    description: 'Restores a save',
    accessableby: 'Moderators'
  },
  run: async (client, message, args) => {
    let authRoles = message.member.roles.cache
    if (authRoles.some(r => r.name === 'Admin') || authRoles.some(r => r.name === 'Moderator') || authRoles.some(r => r.name === 'dev')) {
      if (!args[0]) { // no argument at all
        let choiceEmbed = new Discord.MessageEmbed()
          .setTitle('Server Rollback Choices')
          .setDescription('Choices of a Factorio Server Rollback. This shows **all** folders in the `servers` directory, some may not be Factorio server folders')
          .setColor('GREEN')
          .setAuthor(`${message.guild.me.displayName} Help`, message.guild.iconURL)
          .setThumbnail(client.user.displayAvatarURL())
          .setFooter(
            `© ${message.guild.me.displayName} | Developed by DistroByte & oof2win2 | Total Commands: ${client.commands.size}`,
            client.user.displayAvatarURL()
          )
        let dirData = getServerList();
        dirData = bubbleSort(dirData);
        dirData.forEach(dir => {
          if (fs.statSync('../servers/' + dir).isDirectory()) choiceEmbed.addField(`\`${dir}\``, '\u200B'); //check if it is a directory and if yes add it to the embed
        });
        return message.channel.send(choiceEmbed)
      }
      if (!args[1]) { // no second argument, only server name
        let choiceEmbed = new Discord.MessageEmbed()
          .setTitle('Server Rollback Choices')
          .setDescription('Choices of a Factorio Server Rollback. This shows **all** .zip files, some may not be Factorio saves. **Most are sorted by date last modified, check the date in the field below the save name**')
          .setColor('GREEN')
          .setAuthor(`${message.guild.me.displayName} Help`, message.guild.iconURL)
          .setThumbnail(client.user.displayAvatarURL())
          .setFooter(
            `© ${message.guild.me.displayName} | Developed by DistroByte & oof2win2 | Total Commands: ${client.commands.size}`,
            client.user.displayAvatarURL()
          )
        let dir = '../servers/' + args[0] + '/saves'

        // find all files in $dir and sort them by date modified
        dirData = await sortModifiedDate(dir).catch((err) => { console.log(err) });


        for (let i = 0; i < 25; i++) { // max number of fields in a Discord Embed is 25
          if (!dirData[i]) break;
          if (dirData[i] && dirData[i].endsWith('.zip')) {
            let data = fs.statSync(dir + '/' + dirData[i])
            let date = new Date(data.birthtimeMs)
            choiceEmbed.addField(`\`${dirData[i].split('.')[0]}\``, `Save created on: ${date.toUTCString()}`);
          }
        }


        return message.channel.send(choiceEmbed)
      }
      if (args[0] && args[1]) { // both server name and save name are provided
        let choiceEmbed = new Discord.MessageEmbed()
          .setTitle('Server Rollback')
          .setDescription('Server restore success.')
          .setColor('GREEN')
          .setAuthor(`${message.guild.me.displayName} Help`, message.guild.iconURL)
          .setThumbnail(client.user.displayAvatarURL())
          .setFooter(
            `© ${message.guild.me.displayName} | Developed by DistroByte & oof2win2 | Total Commands: ${client.commands.size}`,
            client.user.displayAvatarURL()
          )
          .addField(`Rolled back server \`${args[0]}\` to save \`${args[1]}\``, 'You may need to start the server with a separate command');

        try { // see if priviliges are ok
          await exec('test -w .');
        } catch (e) {
          return message.channel.send(`Insufficient permissions. Error: ${e}`);
        }
        try { // stop the server
          let out = await exec(absPath + '/' + args[0] + '/factorio-init/factorio stop');
        } catch (e) {
          return message.channel.send(`server restore: stop error: ${e}`);
        }

        try { // load a different server
          let out = await exec(absPath + '/' + args[0] + '/factorio-init/factorio load-save ' + args[1]);
        } catch (e) {
          return message.channel.send(`server restore: load error: ${e}`);
        }

        try { // start the server back up
          let out = await exec(absPath + '/' + args[0] + '/factorio-init/factorio start');
        } catch (e) {
          return message.channel.send(`server restore: start error: ${e}`);
        }
        return message.channel.send(choiceEmbed);
      }
    }
  }
}
