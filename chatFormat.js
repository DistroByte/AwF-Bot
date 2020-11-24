const functions = require('./functions');
const { filterBan } = require("./filterBan");
const servers = require("./servers.json")

module.exports = function chatFormat(line, channel, client, serverConsoleName) {
  const helpdesk = client.channels.cache.get('590241134740111387');
  const moderators = client.channels.cache.get('697146357819113553');

  if (line.includes('[KICK] ')) {
    line = line.slice(line.indexOf('[KICK] ') + '[KICK] '.length);
    line = line.split(' ');
    const player = line[0];
    const doneBy = line[4];
    const reason = line.slice(6)
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
  
  if (line.includes("Error")) {
    if (client.channels.cache.get(channel).name !== 'dev-dump')
      client.channels.cache.get('697146357819113553').send(`Error in ${client.channels.cache.get(channel).name}: ${line}`)
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
        functions.rconCommand(`/w ${tmp[0]} Please check your Discord DMs. Enable them from the AwF server for this linking if you have it disabled`, serverConsoleName);
      }
      if (line != '') //see the last regex in formatChatData, tests if the line is only whitespaces and things such as [gps]
        return client.channels.cache.get(channel).send(`<Game Chat> ${line}`);
      else
        return
    }
    //join
    if (line.includes('[JOIN]')) {
      // check if a player is linked to factorio. if not, tell them to get linked
      const username = functions.formatChatData(line).slice(2).split(' ')[0];
      functions.searchOneDB("otherData", "linkedPlayers", { factorioName: username})
        .then(out => {
          if (out == null) {
            Object.keys(servers).forEach(server => {
              if (servers[server].discordChannelID == client.channels.cache.get(channel).id) {
                functions.rconCommand(`/w ${username} Welcome to AwF. You can join the Discord server on awf.yt and link yourself to Discord with \`!linkme <discordUsername>\`\n`, servers[server].name);
                console.log(servers[server]);
              }
            });
          }
        })
        .catch(err => console.log(err))
    }
    return client.channels.cache.get(channel).send(`**${functions.formatChatData(line)}**`);
  }
  else if (line.includes('JLOGGER:')) {
    line = line.slice((line.indexOf('JLOGGER:') + 'JLOGGER:'.length + 1))
    functions.parseJammyLogger(line, client.channels.cache.get(channel));
  }
}
