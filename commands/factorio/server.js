const child = require('child_process');
const { absPath } = require('../../botconfig.json');

module.exports = {
    config: {
        name: 'testServerStart',
        aliases: ['tss', 'teststart', 'startt', 'ftstart', 'fts'],
        usage: '',
        category: 'factorio',
        description: 'Start the dev testing server',
        accessableby: 'Moderators'
    },
    run: async (client, message, args) => {
        let authRoles = message.member.roles.cache

        if (authRoles.some(r => r.name === 'Admin') || authRoles.some(r => r.name === 'Moderator') || authRoles.some(r => r.name === 'dev')) {
            try {
                console.log('attempt');
                let a = child.exec(`/opt/factorio/servers/test/factorio-init/factorio start`);
            } catch (e) {
                return console.log(e);
            }
            return message.channel.send('Test server started').then(message.delete, { timeout: 5000 });
        }
    }
}