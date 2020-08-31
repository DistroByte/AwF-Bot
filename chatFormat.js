const functions = require('./functions');
const { filterBan } = require("./filterBan");

module.exports = function chatFormat(line, channel, client) {
  const helpdesk = client.channels.cache.get('590241134740111387')

  if (line.includes('[JOIN]')) {
    filterBan(line.slice((line.indexOf(']') + 2), (line.indexOf('joined the game') - 1)));
  }
  if (line.includes('<server>')) return
  if (line.includes('; Factorio')) {
    return client.channels.cache.get(channel).setTopic(`Running ${functions.formatVersion(line)} since ${functions.formatDate(line)}`);
  }
  if (line.includes('?griefer')) {
    //mentions 548545406653431810 (Admin) and 555824650324672522 (Moderator)
    helpdesk.send(`<@&548545406653431810> <@&555824650324672522>! Griefer on <@${client.channels.cache.get(channel)}>`);
  }
  else if (line.includes('[JOIN]') || line.includes('[LEAVE]') || line.includes('[CHAT]')) {
    if (line.includes('[CHAT]')) {
      return client.channels.cache.get(channel).send(`<Game Chat> ${functions.formatChatData(line)}`);
    } else {
      return client.channels.cache.get(channel).send(`**${functions.formatChatData(line)}**`);
    }
  }
}
