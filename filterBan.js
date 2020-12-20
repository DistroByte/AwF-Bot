const banList = require("./banlist-full.json");
const { sendToAll } = require("./functions");

function filterBan(user, channel, client) {
  let toSendChannel = client.channels.cache.get(channel);
  if (banList.find((users) => users.username === user)) {
    sendToAll(`/ban ${user} Please visit http://awf.yt to contest your ban`);
    console.log(`Banned user ${user}`);
    toSendChannel.send(
      `**Banned user ${user}**\nFurther joins are not real joins`
    );
  } else return;
}
exports.filterBan = filterBan;
