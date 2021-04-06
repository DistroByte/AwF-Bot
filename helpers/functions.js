const nodemailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');
const { emailUser, emailPass } = require('../config')

module.exports = {
  getPrefix(message, data) {
    if (message.channel.type !== 'dm') {
      const prefixes = [
        `<@!${message.client.user.id}> `,
        `<@${message.client.user.id}> `,
        message.client.user.username.toLowerCase(),
        data.guild.prefix
      ];
      let prefix = null;
      prefixes.forEach(p => {
        if (message.content.startsWith(p) || message.content.toLowerCase().startsWith(p)) {
          prefix = p;
        };
      });
      return prefix;
    } else {
      return true;
    }
  },

  async supportLink(client) {
    const guild = client.guilds.cache.get(client.config.support.id);
    const member = guild.me;
    const channel = guild.channels.cache.find((ch) => ch.permissionsFor(member.id).has('CREATE_INSTANT_INVITE'));
    if (channel) {
      const invite = await channel.createInvite({ maxAge: 0 }).catch(() => { });
      return invite ? invite.url : null;
    } else {
      return 'https://dbyte.xyz';
    }
  },

  sortByKey(array, key) {
    return array.sort(function (a, b) {
      const x = a[key];
      const y = b[key];
      return ((x < y) ? 1 : ((x > y) ? -1 : 0));
    });
  },

  shuffle(pArray) {
    const array = [];
    pArray.forEach(element => array.push(element));
    let currentIndex = array.length, temporaryValue, randomIndex;
    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }
    return array;
  },

  randomNum(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
  },

  convertTime(guild, time) {
    const absoluteSeconds = Math.floor((time / 1000) % 60);
    const absoluteMinutes = Math.floor((time / (1000 * 60)) % 60);
    const absoluteHours = Math.floor((time / (1000 * 60 * 60)) % 24);
    const absoluteDays = Math.floor(time / (1000 * 60 * 60 * 24));

    const d = absoluteDays
      ? absoluteDays === 1
        ? '1 day'
        : `${absoluteDays} days`
      : null;
    const h = absoluteHours
      ? absoluteHours === 1
        ? '1 hour'
        : `${absoluteHours} hours`
      : null;
    const m = absoluteMinutes
      ? absoluteMinutes === 1
        ? '1 minute'
        : `${absoluteMinutes} minutes`
      : null;
    const s = absoluteSeconds
      ? absoluteSeconds === 1
        ? '1 second'
        : `${absoluteSeconds} seconds`
      : null;

    const absoluteTime = [];
    if (d) absoluteTime.push(d);
    if (h) absoluteTime.push(h);
    if (m) absoluteTime.push(m);
    if (s) absoluteTime.push(s);

    return absoluteTime.join(', ');
  },

  getLevel(xp) {
    return level = Math.floor((((3888 * xp ** 2 + 291600 * xp - 207025) ** (0.5) / (40 * 3 ** (3 / 2)) + ((3 * (3 * xp)) / 5 + 2457 / 4) / 6 - 729 / 8) ** (1 / 3) + 61 / (12 * ((3888 * xp ** 2 + 291600 * xp - 207025) ** (0.5) / (40 * 3 ** (3 / 2)) + ((3 * (3 * xp)) / 5 + 2457 / 4) / 6 - 729 / 8) ** (1 / 3)) - 9 / 2))
  },

  getCommunitiveXp(lvl) {
    return communitive = Math.floor(((5 * lvl * lvl * lvl) / 3) + ((45 * lvl * lvl) / 2) + ((455 * lvl) / 6))
  },

  getLevelXp(lvl) {
    return levelXp = 5 * Math.floor(lvl / 1) ** 2 + 50 * Math.floor(lvl / 1) + 100
  },
  sendEmail: function (emailAddress, contents, callback) {
    let transporter = nodemailer.createTransport(smtpTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      auth: {
        user: `${emailUser}`,
        pass: `${emailPass}`
      }
    }));

    const mailOptions = {
      from: "comfybotemail@gmail.com",
      to: `${emailAddress}`,
      subject: "Verification Code",
      text: `${contents}`
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
        callback(error)
      } else {
        console.log('Email sent: ' + info.response);
        callback(info)
      }
    })
  },
}