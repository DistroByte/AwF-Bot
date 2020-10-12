const { sendToAll } = require('../../functions')
const fs = require('fs')
const { exec } = require("child_process")
const { absPath } = require('../../botconfig.json');
const Discord = require('discord.js')

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
        let dirData = fs.readdirSync('../servers/')
        dirData.forEach(dir => {
          if (fs.statSync('../servers/'+dir).isDirectory()) choiceEmbed.addField(`\`${dir}\``, '\u200B'); //check if it is a directory and if yes add it to the embed
        });
        return message.channel.send(choiceEmbed)
      }
      if (!args[1]) { // no second argument, only server name
        let choiceEmbed = new Discord.MessageEmbed()
          .setTitle('Server Rollback Choices')
          .setDescription('Choices of a Factorio Server Rollback. This shows **all** .zip files, some may not be Factorio saves')
          .setColor('GREEN')
          .setAuthor(`${message.guild.me.displayName} Help`, message.guild.iconURL)
          .setThumbnail(client.user.displayAvatarURL())
          .setFooter(
            `© ${message.guild.me.displayName} | Developed by DistroByte & oof2win2 | Total Commands: ${client.commands.size}`,
            client.user.displayAvatarURL()
          )
        let dir = '../servers/'+args[0]
        let dirData = fs.readdirSync(dir) // add in all file names that end with .zip
        for (let i = 0; i < 25; i++) { // max number of fields in a Discord Embed is 25
          if (!dirData[i]) break;
          if (dirData[i] && dirData[i].endsWith('.zip')) {
            let data = fs.statSync(dir+'/'+dirData[i])
            let date = new Date(data.birthtimeMs)
            choiceEmbed.addField(`\`${dirData[i]}\``, `Save created on: ${date.toUTCString()}`);
          }
        }
        return message.channel.send(choiceEmbed)
      }
      if (args[0] && args[1]) { // both server name and save name are provided
        let choiceEmbed = new Discord.MessageEmbed()
          .setTitle('Server Rollback')
          .setDescription('Choices of a Factorio Server Rollback. This shows **all** .zip files, some may not be Factorio saves')
          .setColor('GREEN')
          .setAuthor(`${message.guild.me.displayName} Help`, message.guild.iconURL)
          .setThumbnail(client.user.displayAvatarURL())
          .setFooter(
            `© ${message.guild.me.displayName} | Developed by DistroByte & oof2win2 | Total Commands: ${client.commands.size}`,
            client.user.displayAvatarURL()
          )
          .addField(`Rolling back server ${args[0]} to save ${args[1]}`, '\u200B');
        exec(absPath+'/'+args[0]+'/factorio-init/factorio stop', (error, stdout, stderr) => { //stop the factorio server
          if (error) {
              console.log(`server stop error: ${error.message}`);
              return;
          }
          if (stderr) {
              console.log(`server stop stderr: ${stderr}`);
              return;
          }
          console.log(`server stop stdout: ${stdout}`);
        });
        exec(absPath+'/'+args[0]+'/factorio-init/factorio load-save '+args[1], (error, stdout, stderr) => { //reload save of the factorio server
          if (error) {
              console.log(`server load error: ${error.message}`);
              return;
          }
          if (stderr) {
              console.log(`server load stderr: ${stderr}`);
              return;
          }
          console.log(`server load stdout: ${stdout}`);
        });
        exec(absPath+'/'+args[0]+'/factorio-init/factorio start', (error, stdout, stderr) => { //start the factorio server
          if (error) {
              console.log(`server start error: ${error.message}`);
              return;
          }
          if (stderr) {
              console.log(`server start stderr: ${stderr}`);
              return;
          }
          console.log(`server start stdout: ${stdout}`);
        });
        return message.channel.send(choiceEmbed);
      }
    }
  }
}
