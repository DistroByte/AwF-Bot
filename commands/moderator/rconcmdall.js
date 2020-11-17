const { rconCommand } = require('../../functions')
const serverJson = require('../../servers.json')

module.exports = {
    config: {
        name: 'rconcmdall',
        aliases: ['rconcommandall', 'sendcmdall', 'fcommandall'],
        usage: '<factorio rcon command>',
        category: 'moderator',
        description: 'Sends a command to all Factorio servers',
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
            const command = args.join(' ')
            servers.forEach(async (server) => {
                let res = await rconCommand(command, server);
                if (res[1] == 'error') return message.channel.send(`${server}: Error. Command may have worked, but didn't give a response: ${res[0]}`)
                return message.channel.send(`${server}: Command worked. Output: \n \`${res[0]}\``)
            });
        }
    }
}