const { ServerFifoManager } = require("../../utils/fifo-manager");
const { testbotid } = require("../../botconfig.json")

module.exports = (client, oldPresence, newPresence) => {
    if (newPresence.userID == testbotid) {
        ServerFifoManager.checkDevServer(newPresence);
    }
}