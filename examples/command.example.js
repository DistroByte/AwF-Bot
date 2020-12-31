module.exports = {
  config: {
    name: "commandname",  // command name - MUST be lowercase
    aliases: ["aliases"], // aliases for the command, lowercase too
    usage: "<server name>", // usage of the command
    category: "moderator",  // category of the command (folder name in commands)
    description: "description", // command description
    accessableby: "Moderators", // accessibility of command
  },
  run: async (client, message, args) => {
    // stuff for command to do
  },
};
