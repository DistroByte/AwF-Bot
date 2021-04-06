const Command = require("../../base/Command");
const { MessageAttachment } = require('discord.js');

const { createCanvas, loadImage } = require('canvas');
const width = 1000
const height = 300
const canvas = createCanvas(width, height)
const context = canvas.getContext('2d')

class Rank extends Command {
  constructor(client) {
    super(client, {
      name: "rank",
      description: "Gets your current rank",
      usage: "(@member/member)",
      examples: ["{{p}}rank", "{{p}}rank @DistroByte#0001", "{{p}}rank DistroByte"],
      dirname: __dirname,
      enabled: true,
      guildOnly: true,
      aliases: ["level", "lvl", "exp", "xp"],
      memberPermissions: [],
      botPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
      nsfw: false,
      ownerOnly: false,
      args: false,
      cooldown: 3000
    });
  }

  async run(message, args, data) {
    let user;

    // if (!message.mentions.members.first()) {
    if (args[0]) {
      user = await this.client.resolveUser(args[0]);
    }

    if (!user) user = message.author

    if (user.bot) return message.channel.send("Bots can't have xp!");

    let memberXp = new Map();
    data.guild.members.forEach(m => { memberXp.set(m.id, m.xp) });

    let xp = memberXp.get(user.id);

    var sortable = new Map([...memberXp.entries()].sort(function (a, b) {
      return b[1] - a[1];
    }));

    var rank = 1;
    for (var [key, value] of sortable.entries()) {
      if (key !== user.id) {
        rank += 1
      } else {
        break
      }
    }

    var currentLvl = this.client.functions.getLevel(xp) || 0;
    var currentXP = xp - this.client.functions.getCommunitiveXp(currentLvl) || 0;
    var levelXP = this.client.functions.getLevelXp(currentLvl) || 0;

    context.fillStyle = '#23272A'
    context.fillRect(0, 0, width, height)

    context.beginPath();
    context.arc(305, 220, 20, 0.5 * Math.PI, Math.PI * 1.5, false);
    context.arc(910, 220, 20, Math.PI * 1.5, Math.PI * 0.5, false);
    context.closePath();
    context.lineWidth = 3;
    context.stroke();

    context.font = "50px Arial";
    context.fillStyle = "#FEFEFE";
    context.fillText(`${user.username}`, 305, 190);
    let usernameWidth = context.measureText(`${user.username}`).width

    context.font = "25px Arial";
    context.fillStyle = "#828282";
    context.fillText(`#${user.discriminator}`, 305 + usernameWidth, 190)

    if (xp != 0) {
      context.beginPath();
      context.arc(305, 220, 19, 0.5 * Math.PI, Math.PI * 1.5, false);
      context.arc(305 + Math.floor((currentXP / levelXP) * 605), 220, 19, Math.PI * 1.5, Math.PI * 0.5, false);
      context.closePath();
      context.lineWidth = 3;
      context.fillStyle = "green";
      context.fill();
    }

    context.font = "60px Arial";
    context.fillStyle = "#FEFEFE";
    context.fillText(currentLvl, 928 - context.measureText(currentLvl).width, 108);
    var currentLevelWidth = context.measureText(currentLvl).width

    context.font = "25px Arial";
    context.fillStyle = "#828282";
    context.fillText(`LEVEL`, 928 - currentLevelWidth - context.measureText(`LEVEL `).width, 108);
    currentLevelWidth = currentLevelWidth + context.measureText(`LEVEL `).width

    context.font = "50px Arial";
    context.fillStyle = "#FEFEFE";
    context.fillText(`#${rank}`, 928 - currentLevelWidth - context.measureText(`#${rank}`).width - 5, 108)
    currentLevelWidth = currentLevelWidth + context.measureText(`#${rank}`).width

    context.font = "25px Arial";
    context.fillStyle = "#828282";
    context.fillText(`RANK`, 928 - currentLevelWidth - context.measureText(`LEVEL `).width, 108);

    var formattedCurrentXP;
    if (currentXP > 1000) {
      formattedCurrentXP = (currentXP / 1000).toFixed(2) + "K"
    } else {
      formattedCurrentXP = currentXP
    }

    context.font = "25px Arial";
    context.fillStyle = "#FEFEFE";
    context.fillText(`${formattedCurrentXP} `, 720, 190)
    var currentXPWidth = context.measureText(`${formattedCurrentXP} `).width;

    var formattedlevelXP;
    if (levelXP > 1000) {
      formattedlevelXP = (levelXP / 1000).toFixed(2) + "K"
    } else {
      formattedlevelXP = levelXP
    }
    context.fillStyle = "#828282";
    context.fillText(`/ ${formattedlevelXP} XP`, 720 + currentXPWidth, 190)

    context.beginPath();
    context.arc(150, 150, 100, 0, Math.PI * 2);
    context.closePath();
    context.lineWidth = 5;
    context.stroke();
    context.save()
    context.clip();

    const avatar = await loadImage(user.displayAvatarURL({ format: 'jpg' }));
    context.drawImage(avatar, 50, 50, 200, 200)

    context.restore()

    var buffer = canvas.toBuffer('image/png')

    const attachment = new MessageAttachment(buffer);
    message.channel.send(attachment);
  }
}

module.exports = Rank;