const { ErrorManager } = require("../../utils/error-manager");
const { clientErrChannelID } = require("../../botconfig.json");

module.exports = (client) => {
  console.log(
    `${client.user.username} is online: ${new Date().toString().slice(4, 24)}`
  );

  let activities = [
      `${client.guilds.cache.size} servers!`,
      `${client.channels.cache.size} channels!`,
      `${client.users.cache.size} users!`,
    ],
    i = 0;
  setInterval(
    () =>
      client.user.setActivity(
        `${client.prefix}help | ${activities[i++ % activities.length]}`,
        { type: "WATCHING" }
      ),
    15000
  );

  client.channels.fetch(clientErrChannelID)
    .then(channel => {
      ErrorManager.setJammyErrChannel(channel);
    })
};
