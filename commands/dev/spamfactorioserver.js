const { Server } = require("mongodb");
const serverJson = require("../../servers.json");
const { ServerFifoManager } = require("../../utils/fifo-manager")

module.exports = {
    config: {
        name: "spamfactorioserver",
        aliases: [],
        usage: "<server ping> <number of messages> [message to send]",
        category: "dev",
        description: "Spam a Factorio server with lots of chat stuff",
        accessableby: "Dev",
    },
    run: async (client, message, args) => {
        let authRoles = message.member.roles.cache;
        if (
            !authRoles.some((r) => ["Admin", "dev"].includes(r.name))
        ) {
            // if user is not Admin/Moderator/dev
            return message.channel.send(
                "You don't have enough priviliges to run this command!"
            );
        }
        if (!message.mentions.channels.first()) return message.channel.send("Mention a channel to spam!");
        if (!args[1] || !parseInt(args[1])) return message.channel.send("Specify how many messages!");
        const toSpam = args.slice(2).join(" ");
        for (let i = 0; i < parseInt(args[1]); i++) {
            ServerFifoManager.sendToServer({ content: `${i + 1} attempt at spam..`, channel: { id: (message.mentions.channels.first()).id } }, false);
        }
    },
};
