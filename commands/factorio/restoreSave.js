const { sendToAll } = require('../../functions')
const { fs } = require('fs')
const { exec } = require("child_process")
const { absPath } = require('../../botconfig.json');

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
          .setTitle('Server Rollback Choices');
          .setDescription('Choices of a Factorio Server Rollback. This shows **all** folders in the `servers` directory, some may not be Factorio server folders');
          .setColor('GREEN');
          .setAuthor(`${message.guild.me.displayName} Help`, message.guild.iconURL);
          .setThumbnail(client.user.displayAvatarURL());
          .setFooter(
            `© ${message.guild.me.displayName} | Developed by DistroByte & oof2win2 | Total Commands: ${client.commands.size}`,
            client.user.displayAvatarURL()
          );
        await fs.readdir('../servers/', (err, files) => { // add in all file names that end with .zip
          if (err) console.log(err);
          else {
            files.forEach(file => {
              if (file.endsWith('.zip')) choiceEmbed.addField(file, '\u200B');
            });
          }
        })
        return message.channel.send(choiceEmbed)
      }
      if (!args[1]) { // no second argument, only server name
        let choiceEmbed = new Discord.MessageEmbed()
          .setTitle('Server Rollback Choices');
          .setDescription('Choices of a Factorio Server Rollback. This shows **all** .zip files, some may not be Factorio saves');
          .setColor('GREEN');
          .setAuthor(`${message.guild.me.displayName} Help`, message.guild.iconURL);
          .setThumbnail(client.user.displayAvatarURL());
          .setFooter(
            `© ${message.guild.me.displayName} | Developed by DistroByte & oof2win2 | Total Commands: ${client.commands.size}`,
            client.user.displayAvatarURL()
          );
          await fs.readdir('../servers/'+args[0], (err, files) => { // add in all file names that end with .zip
            if (err) console.log(err);
            else {
              files = files.map(function (fileName) {
                return {
                  name: fileName,
                  time: fs.statSync(dir + '/' + fileName).mtime.getTime()
                };
              })
              .sort(function (a, b) {
                return a.time - b.time; })
              .map(function (v) {
                return v.name; });
              for (let i = 0; i < 25; i++) { // max number of fields in a Discord Embed is 25
                if (!files[i]) break;
                // console.log(files[i])
                if (files[i]){
                  choiceEmbed.fields.push({name: files[i], value: 'hello'});
                  console.log(files[i], '1')
                }
              }
            }
          })
        return message.channel.send(choiceEmbed)
      }
      if (args[0] && args[1]) { // both server name and save name are provided
        let choiceEmbed = new Discord.MessageEmbed()
          .setTitle('Server Rollback');
          .setDescription('Choices of a Factorio Server Rollback. This shows **all** .zip files, some may not be Factorio saves');
          .setColor('GREEN');
          .setAuthor(`${message.guild.me.displayName} Help`, message.guild.iconURL);
          .setThumbnail(client.user.displayAvatarURL());
          .setFooter(
            `© ${message.guild.me.displayName} | Developed by DistroByte & oof2win2 | Total Commands: ${client.commands.size}`,
            client.user.displayAvatarURL()
          );
          .addField(`Rolling back server ${args[0]} to save ${args[1]}`);
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
