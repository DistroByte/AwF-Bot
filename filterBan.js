const banList = require('./banlist-full.json');
const { chronoFifo, coreFifo, coronaFifo, eventFifo, islandicFifo, seablockFifo, testFifo, krastorioFifo, spiderFIFO } = require("./index");
function filterBan(user) {
  if (banList.find(users => users.username === user)) {
    chronoFifo.write(`/ban ${user}`);
    coreFifo.write(`/ban ${user}`);
    coronaFifo.write(`/ban ${user}`);
    eventFifo.write(`/ban ${user}`);
    islandicFifo.write(`/ban ${user}`);
    seablockFifo.write(`/ban ${user}`);
    testFifo.write(`/ban ${user}`);
    krastorioFifo.write(`/ban ${user}`);
    spiderFIFO.write(`/ban ${user}`);
    console.log(`banned user ${user}`);
  }
  else
    return console.log(`did not ban user ${user}`);
}
exports.filterBan = filterBan;
