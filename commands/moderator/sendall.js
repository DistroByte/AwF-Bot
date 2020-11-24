const { sendToAll } = require("../../functions");

module.exports = {
  config: {
    name: "sendall",
    aliases: ["sendall", "fcommandall"],
    usage: "<factorio server command>",
    category: "moderator",
    description: "Sends a command to all servers with a username",
    accessableby: "Moderators",
  },
  run: async (client, message, args) => {
    let authRoles = message.member.roles.cache;

    if (
      authRoles.some((r) => r.name === "Admin") ||
      authRoles.some((r) => r.name === "Moderator") ||
      authRoles.some((r) => r.name === "dev")
    ) {
      message.content = message.content.slice(9); //prefixes the message with a / to start commands in Factorio
      sendToAll(message, true); //sends the command to all servers with a username
      return message.channel
        .send("Success!")
        .then((message) => message.delete({ timeout: 5000 }));
    }
  },
};
