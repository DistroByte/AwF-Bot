const banList = require('./banlist-full.json');

function filterBan(user) {
  if (banList.find(users => users.username === user)) {
    sendToAll(`/ban ${user}`);
    console.log(`banned user ${user}`);
  }
  else
    return console.log(`did not ban user ${user}`);
}
exports.filterBan = filterBan;
