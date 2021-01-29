const { RconConnectionManager } = require("../../utils/rcon-connection");

module.exports = {
    config: {
        name: "reconnectrcon",
        aliases: [],
        usage: "",
        category: "moderator",
        description: "Reconnects all RCON connections",
        accessableby: "Moderators",
    },
    run: async (client, message, args) => {
        let authRoles = message.member.roles.cache;

        if (!authRoles.some((r) => ["Admin", "Moderator", "dev"].includes(r.name))) {
            // if user is not Admin/Moderator/dev
            return message.channel.send("You don't have enough priviliges to run this command!");
        }
        RconConnectionManager.refreshRcon();
        return message.channel.send("Rcon connections restarted!");
    },
};
