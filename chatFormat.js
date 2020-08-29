const functions = require('./functions');
const { filterBan } = require("./filterBan");

module.exports = function chatFormat(line, channel, client) {
  if (line.includes('[JOIN]')) {
    filterBan(line.slice((line.indexOf(']') + 2), (line.indexOf('joined the game') - 1)));
  }
  if (line.includes('; Factorio')) {
    return client.channels.cache.get(channel).setTopic(`Running ${functions.formatVersion(line)} since ${functions.formatDate(line)}`);
  }
  else if (line.includes('[JOIN]') || line.includes('[LEAVE]') || line.includes('[CHAT]')) {
    if (line.includes('[CHAT]')) {
      return client.channels.cache.get(channel).send(`<Game Chat> ${functions.formatChatData(line)}`);
    } else {
      return client.channels.cache.get(channel).send(`**${functions.formatChatData(line)}**`);
    }
  }
}