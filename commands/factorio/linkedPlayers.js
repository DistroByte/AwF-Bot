const Discord = require('discord.js')
const { searchOneDB, bubbleSort } = require('../../functions')

module.exports = {
    config: {
        name: 'amILinked',
        aliases: ['amilinked', 'islinked', 'isLinked'],
        usage: '[factorioName]',
        category: 'factorio',
        description: 'Search if player is linked between Factorio and Discord',
        accessableby: 'Members'
    },
    run: async (client, message, args) => {
        if (!args[0]) { // no argument at all
            let res = await searchOneDB("otherData", "linkedPlayers", { factorioName: message.author.username})
            if (res == null) return message.channel.send('You are not linked yet');
            else return message.channel.send('You are already linked!'); 
        }
        if (!args[1]) { // if the server name is provided but no 2nd argument, searches for generic server data
            let res = await searchOneDB("otherData", "linkedPlayers", { factorioName: args[0] })
            if (res == null) return message.channel.send(`\`${args[0]}\` is not linked yet`);
            else return message.channel.send(`\`${args[0]}\` is already linked!`); 
        }
    }
}