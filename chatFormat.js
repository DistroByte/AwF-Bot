const functions = require('./functions');

module.exports = function chatFormat(line, array, channel, client) {
  if (line.includes('<server>')) {
    return functions.arrayRemoveOne(array, line);
  }
  if (line.includes('; Factorio')) {
    client.channels.cache.get(channel).setTopic(`Running ${functions.formatVersion(line)} since ${functions.formatDate(line)}`);
    return functions.arrayRemoveOne(array, line);
  }
  else if (line.includes('[JOIN]') || line.includes('[LEAVE]') || line.includes('[CHAT]')) {
    // if (line.includes('[gps')) {
    //   let res = line.replace(/(\[gps=-?[0-9]*,-?[0-9]*])/g, '');
    //   console.log(res)
    //   client.channels.cache.get(channel).send(`<Game Chat> ${functions.formatChatData(res)}`);
    //   return functions.arrayRemoveOne(array, line);
    // 
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