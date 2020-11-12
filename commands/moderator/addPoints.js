const { changePoints } = require('../../functions')
const fs = require('fs');
const { absPath } = require('../../botconfig.json');
const Discord = require('discord.js')

module.exports = {
    config: {
        name: 'addPoints',
        aliases: ['addPoints', 'addpoints', 'ap'],
        usage: '<save name>',
        category: 'moderator',
        description: 'Restores a save',
        accessableby: 'Moderators'
    },
    run: async (client, message, args) => {
        if (!args[1] && args[0]) {
            changePoints(message.author.id, parseInt(args[0]), 'built');
        }
    }
}