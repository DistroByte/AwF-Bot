const { ServerFifoManager } = require("../../utils/fifo-manager");
const { testbotid } = require("../../botconfig.json")

module.exports = (client, oldPresence, newPresence) => {
    if (newPresence.userID == testbotid) {
        // ServerFifoManager.checkDevServer(newPresence);
        console.log(`user <@${newPresence.userID}> changed their presence to ${newPresence.status}`);
        client.channels.cache.get("723280139982471247").send(`user <@${newPresence.userID}> changed their presence to ${newPresence.status}`);
    }
}