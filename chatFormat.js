const functions = require('./functions');
const { filterBan } = require("./filterBan");

module.exports = function chatFormat(line, array, channel, client) {
  if (line.includes('[JOIN]')) {
    filterBan(line.slice((line.indexOf(']') + 2), (line.indexOf('joined the game') - 1)));
  }
  if (line.includes('<server>')) {
    return functions.arrayRemoveOne(array, line);
  }
  if (line.includes('; Factorio')) {
    client.channels.cache.get(channel).setTopic(`Running ${functions.formatVersion(line)} since ${functions.formatDate(line)}`);
    return functions.arrayRemoveOne(array, line);
  }
  else if (line.includes('[JOIN]') || line.includes('[LEAVE]') || line.includes('[CHAT]')) {
    if (line.includes('[CHAT]')) {
      client.channels.cache.get(channel).send(`<Game Chat> ${functions.formatChatData(line)}`);
      return functions.arrayRemoveOne(array, line);
    } else {
      client.channels.cache.get(channel).send(`**${functions.formatChatData(line)}**`);
      return functions.arrayRemoveOne(array, line);
    }
  }
  return functions.arrayRemoveOne(array, line);
}