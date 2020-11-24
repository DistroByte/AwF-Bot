const { rconCommand } = require("../../functions");
const serverJson = require("../../servers.json");

module.exports = {
  config: {
    name: "rconcmd",
    aliases: ["rconcommand", "sendcmd", "fcommand"],
    usage: "<server name> <factorio rcon command>",
    category: "moderator",
    description: "Sends a command to a single Factorio server",
    accessableby: "Moderators",
  },
  run: async (client, message, args) => {
    let authRoles = message.member.roles.cache;

    if (
      authRoles.some((r) => r.name === "Admin") ||
      authRoles.some((r) => r.name === "Moderator") ||
      authRoles.some((r) => r.name === "dev")
    ) {
      var server;
      if (message.mentions.channels.first()) {
        Object.keys(serverJson).forEach((element) => {
          if (
            serverJson[element].serverFolderName != "" &&
            serverJson[element].discordChannelID ==
              message.mentions.channels.first().id
          )
            //if server isn't hidden
            server = serverJson[element].name;
        });
      } else {
        server = args[0];
      }

      const cmdArr = args.slice(1);
      const command = cmdArr.join(" ");
      let res = await rconCommand(command, server);
      if (res[1] == "error")
        return message.channel.send(
          `Error. Command may have worked, but didn't give a response: ${res[0]}`
        );
      return message.channel.send(`Command worked. Output: \n \`${res[0]}\``);
    }
  },
};
