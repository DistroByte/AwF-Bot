/**
 * @file Discord bot event handlers. To add new events, add into the events folder according to the event
 */
const { readdirSync } = require("fs");

module.exports = (client) => {
  const load = (dirs) => {
    const events = readdirSync(`./events/${dirs}/`).filter((d) =>
      d.endsWith(".js")
    );
    for (let file of events) {
      const evt = require(`../events/${dirs}/${file}`);
      let eName = file.split(".")[0];
      client.on(eName, evt.bind(null, client));
    }
  };
  ["client", "guild"].forEach((x) => load(x));
};
