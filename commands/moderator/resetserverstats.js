const { deleteOneDB, searchOneDB } = require('../../functions')

module.exports = {
    config: {
        name: 'resetserverstats',
        aliases: [],
        usage: '<factorio discord channel name>',
        category: 'moderator',
        description: 'Resets the deaths and other statistics of servers',
        accessableby: 'Moderators'
    },
    run: async (client, message, args) => {
        let authRoles = message.member.roles.cache
        if (authRoles.some(r => r.name === 'Admin') || authRoles.some(r => r.name === 'Moderator') || authRoles.some(r => r.name === 'dev')) {
            if (!args[0]) return message.channel.send('Please give a Factorio Discord channel name')
            let sentMsg = await message.channel.send(`Please confirm wiping of server ${args[0]}`);
            sentMsg.react('✅')
            sentMsg.react('❌')
            const filter = (reaction, user) => {
                return user.id === message.author.id;
            };
            sentMsg.awaitReactions(filter, { max: 1, time: 120000, errors: ['time'] })
                .then(async (messageReaction) => {
                    let reaction = messageReaction.first();
                    if (reaction.emoji.name === '❌') return message.channel.send('Wiping cancelled');
                    let blank = false
                    while (!blank) {
                        const res = await searchOneDB(args[0], 'deaths');
                        if (res == null) break;
                        await deleteOneDB(args[0], 'deaths', res);
                    }
                    while (!blank) {
                        const res = await searchOneDB(args[0], 'stats');
                        if (res == null) break;
                        await deleteOneDB(args[0], 'stats', res);
                    }
                    message.channel.send('server cleaned!');
                })
                .catch((out) => {
                    if (out.size == 0) return sendToUser.send(`Didn't react in time. Please try again.`);
                })
        }
    }
}