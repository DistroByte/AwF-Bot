module.exports = {
  config: {
    name: "uptime",
    description: "Displays the bots current uptime!",
    category: "basic",
    usage: "",
    aliases: ["ut"],
  },
  run: async (client, message, args) => {
    function duration(ms) {
      const sec = Math.floor((ms / 1000) % 60).toString();
      const min = Math.floor((ms / (1000 * 60)) % 60).toString();
      const hrs = Math.floor((ms / (1000 * 60 * 60)) % 24).toString();
      const days = Math.floor((ms / (1000 * 60 * 60 * 24)) % 60).toString();
      return `\`${days.padStart(1, "0")}:${hrs.padStart(2, "0")}:${min.padStart(
        2,
        "0"
      )}:${sec.padStart(2, "0")}\``;
    }

    message.channel.send(`My uptime: ${duration(client.uptime)}`);
  },
};
