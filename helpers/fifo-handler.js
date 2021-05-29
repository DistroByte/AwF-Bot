const serversJS = require("../servers.js"); // tails, fifo, discord IDs etc.
const FIFO = require("fifo-js");
const { serverpath } = require("../config")


// TODO: check dev server in presenceUpdate, also add this to the message handler
class _ServerFifoManager {
  constructor() {
    this.usedFifos = [];
    this.unusedFifos = [];
    this.client = undefined;
    serversJS.forEach((server) => {
      try {
        this.usedFifos.push({
          serverFifo: new FIFO(`${serverpath}/${server.path}/server.fifo`),
          serverObject: server,
        });
      } catch (error) {
        console.error(error);
      }
    });
  }
  checkDevServer(newPresence) {
    // test bot turned online
    if (newPresence.status != "offline") {
      this.usedFifos.forEach((server) => {
        if (server.serverObject.dev == true) {
          this.usedFifos = this.usedFifos.filter((currentFifo) => {
            if (!currentFifo.serverObject.dev)
              return currentFifo;
            if (currentFifo.serverObject.dev) {
              this.unusedFifos.push(currentFifo);
              this.client?.logger.log("Turning dev server logging offline. Dev bot online", 'debug')
            }
          });
        }
      });
    }

    // test bot is now offline
    if (newPresence.status == "offline") {
      this.client?.logger.log("Turning dev server logging online. Dev bot offline", 'debug')
      this.unusedFifos = this.unusedFifos.filter((currentFifo) => {
        this.usedFifos.push(currentFifo);
      })
    }
  }

  sendToServer(message, sendWithUsername) {
    let toSend;
    if (sendWithUsername === true)
      toSend = `${message.author.username}: ${message.cleanContent}`
    else
      toSend = `${message.cleanContent}`
    this.usedFifos.forEach((server) => {
			console.log(server.serverObject.discordid, message.channel.id)
      if (server.serverObject.discordid === message.channel.id) {
        server.serverFifo.write(toSend, () => {})
				console.log("SENT")
			}
    });
    return;
  }
  
  sendToAll(message, sendWithUsername) {
    let toSend;
    if (sendWithUsername === true)
      toSend = `${message.author.username}: ${message.cleanContent}`
    else
      toSend = `${message.cleanContent}`
    this.usedFifos.forEach((server) => {
      server.serverFifo.write(toSend, () => { });
    });
  }
}

let ServerFifoManager = new _ServerFifoManager()
module.exports = ServerFifoManager