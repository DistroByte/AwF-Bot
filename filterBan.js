/**
 * @file Ban people who are on the full banlist from all servers
 */
const banList = require("./banlist-full.json");
const { ServerFifoManager } = require("./utils/fifo-manager");

function filterBan(user, channel, client) {
  let toSendChannel = client.channels.cache.get(channel);
  if (banList.find((users) => users.username === user)) {
    ServerFifoManager.sendToAll(`/ban ${user} Please visit http://awf.yt to contest your ban`);
    console.log(`Banned user ${user}`);
    toSendChannel.send(
      `**Banned user ${user}**\nFurther joins are not real joins`
    );
  } else return;
}
exports.filterBan = filterBan;
