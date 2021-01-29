/**
 * @file Command handlers, load in commands
 */
const { readdirSync } = require("fs");

module.exports = (client) => {
  // Do not modify the function if you don't know what you are doing, it will break the bot or break commands
  const load = (dirs) => {
    const commands = readdirSync(`./commands/${dirs}/`).filter((d) =>
      d.endsWith(".js")
    );
    for (let file of commands) {
      let pull = require(`../commands/${dirs}/${file}`);
      client.commands.set(pull.config.name, pull);
      if (pull.config.aliases)
        pull.config.aliases.forEach((a) =>
          client.aliases.set(a, pull.config.name)
        );
    }
  };
  // This is where different command folders are loaded
  // If you want to create a new category, add the category/folder name here
  ["basic", "owner", "factorio", "moderator", "testing"].forEach((x) => load(x));
};
