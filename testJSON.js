//const fs = require('fs');

function init(data) {
  if (data.servers === undefined)
    data.servers = {};
  if (data.servers['core'] === undefined)
    data.servers['core'] = {};
  if (data.servers['core'].players === undefined)
    data.servers['core'].players = {};
  return data
}

function addDeath(data, server, player, reason) {
  if (data.servers[server].players[player] === undefined)
    data.servers[server].players[player] = {};
  if (data.servers[server].players[player][reason] === undefined)
    data.servers[server].players[player][reason] = 0;
  data.servers[server].players[player][reason]++; //adds to the reason
}

function main() {
  data = new Object();
  init(data);
  addDeath(data, 'core', 'oof2win2', 'train');
  addDeath(data, 'core', 'oof2win2', 'biter');
  addDeath(data, 'core', 'oof2win2', 'distro');
  console.log(data.servers['core']);
}

main()
