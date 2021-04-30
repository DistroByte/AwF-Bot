const fifo = require("../../helpers/fifo-handler")


module.exports = class {
  constructor(client) {
    this.client = client;
  }

  async run(_, newPresence) {
    if (newPresence.userID === this.client.config.testbotid)
      fifo.checkDevServer(newPresence)
  }
};