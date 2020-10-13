const { sendToAll } = require('../../functions')

module.exports = {
  config: {
    name: 'sendcmdall',
    aliases: ['fcommandall'],
    usage: '<factorio server command',
    category: 'factorio',
    description: 'description',
    accessableby: 'Moderators'
  },
  run: async (client, message, args) => {
    let authRoles = message.member.roles.cache

    if (authRoles.some(r => r.name === 'Admin') || authRoles.some(r => r.name === 'Moderator') || authRoles.some(r => r.name === 'dev')) {
      message.content = `/${args[0]} ${args[1]} ${args[2] ? args[2] : ''}`;  //prefixes the message with a / to start commands in Factorio
      sendToAll(message.content, false); //sends the command to all servers with no username
      return message.channel.send('Success!').then(message => message.delete({ timeout: 5000 }));
    }
  }
}