const { MessageEmbed } = require("discord.js");
const fetch = require("node-fetch");

module.exports = {
  config: {
    name: "xkcd",
    description: "xkcd comics, get the latest or certain comic",
    usage: "<search|latest> (id)",
    category: "miscellaneous",
  },
  run: async (client, message, args) => {
    if ((args[1] && isNaN(args[1])) || !["search", "latest"].includes(args[0]))
      return message.channel.send("`<search|latest> (id)");
    let search = args[1]
      ? `http://xkcd.com/${args[1]}/info.0.json`
      : "http://xkcd.com/info.0.json";
    try {
      fetch(search)
        .then((res) => res.json())
        .then((res) => {
          if (!res)
            return message.channel.send(
              "No results found for this comic, sorry!"
            );
          let { safe_title, img, day, month, year, num, alt } = res;

          let embed = new MessageEmbed()
            .setColor("GREEN")
            .setDescription(alt ? alt : "*crickets* - No Description")
            .setAuthor(`XKCD | ${safe_title} [${num}]`)
            .setImage(img)
            .setFooter(`Published ${day}/${month}/${year}`);

          message.channel.send(embed);
        });
    } catch (e) {
      console.log(e);
      return message.channel.send("looks like ive broken! Try again.");
    }
  },
};
