const functions = require('./functions');
const { filterBan } = require("./filterBan");

module.exports = function chatFormat(line, channel, client) {
  const helpdesk = client.channels.cache.get('590241134740111387');
  const moderators = client.channels.cache.get('697146357819113553');

  if (line.includes('[KICK] ')) {
    line = line.slice(line.indexOf('[KICK] ') + '[KICK] '.length);
    line = line.split(' ');
    const player = line[0];
    const doneBy = line[4];
    const reason = line.slice(6)
    console.log(reason);
    moderators.send(`Player \`${player}\` has been KICKED by \`${doneBy}\` for reason \`${reason}\``);
    return client.channels.cache.get(channel).send(`Player \`${player}\` has been KICKED by \`${doneBy}\` for reason \`${reason}\``);
  }
  if (line.includes('[BAN] ')) {
    line = line.slice(line.indexOf('[BAN] ') + '[BAN] '.length);
    line = line.split(' ');
    const player = line[0];
    const doneBy = line[4];
    const reason = line.slice(6)
    moderators.send(`Player \`${player}\` has been BANNED by \`${doneBy}\` for reason \`${reason}\``);
    return client.channels.cache.get(channel).send(`Player \`${player}\` has been BANNED by \`${doneBy}\` for reason \`${reason}\``);
  }
  if (line.includes('[MUTED] ')) {
    line = line.slice(line.indexOf('[MUTED] ') + '[MUTED] '.length);
    line = line.split(' ');
    const player = line[0];
    const doneBy = line[4];
    moderators.send(`Player \`${player}\` has been MUTED by \`${doneBy}\``);
    return client.channels.cache.get(channel).send(`Player \`${player}\` has been MUTED by \`${doneBy}\``);
  }
  if (line.includes('[UNBANNED] ')) {
    line = line.slice(line.indexOf('[UNBANNED] ') + '[UNBANNED] '.length);
    line = line.split(' ');
    const player = line[0];
    const doneBy = line[4];
    moderators.send(`Player \`${player}\` has been UNBANNED by \`${doneBy}\``);
    return client.channels.cache.get(channel).send(`Player \`${player}\` has been UNBANNED by \`${doneBy}\``);
  }
  if (line.includes('[UNMUTED] ')) {
    line = line.slice(line.indexOf('[UNMUTED] ') + '[UNMUTED] '.length);
    line = line.split(' ');
    const player = line[0];
    const doneBy = line[4];
    moderators.send(`Player \`${player}\` has been UNMUTED by \`${doneBy}\``);
    return client.channels.cache.get(channel).send(`Player \`${player}\` has been UNMUTED by \`${doneBy}\``);
  }
  
  if (line.includes('?griefer')) {
    //mentions 548545406653431810 (Admin) and 555824650324672522 (Moderator)
    helpdesk.send(`<@&548545406653431810> <@&555824650324672522>! Griefer on ${client.channels.cache.get(channel)}`);
  }
  if (line.includes('[JOIN]')) {
    filterBan(line.slice((line.indexOf(']') + 2), (line.indexOf('joined the game') - 1)), channel, client);
  }
  if (line.includes('<server>')) return
  if (line.includes('; Factorio')) {
    return client.channels.cache.get(channel).setTopic(`Running ${functions.formatVersion(line)} since ${functions.formatDate(line)}`);
  }
  else if (line.includes('[JOIN]') || line.includes('[LEAVE]') || line.includes('[CHAT]')) {
    if (line.includes('[CHAT]')) {
      line = functions.formatChatData(line);
      if (line.includes('!linkme')) {
        let tmp = line.split(": ");
        functions.linkFactorioDiscordUser(client, tmp[0], tmp[1].slice('!linkme '.length));
      }
      if (line != '') //see the last regex in formatChatData, tests if the line is only whitespaces and things such as [gps]
        return client.channels.cache.get(channel).send(`<Game Chat> ${line}`);
      else
        return
    } else {
      return client.channels.cache.get(channel).send(`**${functions.formatChatData(line)}**`);
    }
  }
  else if (line.includes('JLOGGER:')) {
    line = line.slice((line.indexOf('JLOGGER:') + 'JLOGGER:'.length + 1))
    functions.parseJammyLogger(line, client.channels.cache.get(channel));
  }
}
