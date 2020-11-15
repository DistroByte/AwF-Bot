const { rconCommand } = require('../../functions')
const serverJson = require('../../servers.json')

module.exports = {
    config: {
        name: 'rconcmdall',
        aliases: ['rconcommandall', 'sendcmdall', 'fcommandall'],
        usage: '<server name> <factorio rcon command>',
        category: 'moderator',
        description: 'Sends a command to a single Factorio server',
        accessableby: 'Moderators'
    },
    run: async (client, message, args) => {
        let authRoles = message.member.roles.cache

        if (authRoles.some(r => r.name === 'Admin') || authRoles.some(r => r.name === 'Moderator') || authRoles.some(r => r.name === 'dev')) {
            let servers = [];
            Object.keys(serverJson).forEach(element => {
                if (serverJson[element].serverFolderName != '') //if server isn't hidden
                    servers.push(serverJson[element].name);
            })
            console.log(servers)
            const command = args.join(' ')
            servers.forEach(async (server) => {
                let res = await rconCommand(message, command, server);
                if (res[1] == 'error') return message.channel.send(`error ${res[0]}`)
                return message.channel.send(`Command worked. Output: \n \`${res[0]}\``)
            });
        }
    }
}