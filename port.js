const mongoose = require("mongoose")
const config = require("./config")
const User = require("./base/User")

const Comfy = require('./base/Comfy'),
  client = new Comfy();
client.on('ready', () => console.log("Bot logged in"))
client.login(client.config.token)

function wait (time) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, time)
  })
}

mongoose.connect(config.mongoDB, config.dbOptions).then(async () => {
  await wait(5000);
  console.log("waited, running in 500ms")
  await wait(500);
  while (true) {
  const user = await mongoose.connections[0].client.db("otherData").collection("linkedPlayers").findOneAndUpdate({
    ported: {$exists: false}
  }, {
    $set: {"ported": true}
  }).then(u => u.value || undefined)
  if (!user) break
  User.findOne({id: user.discordID}).then((foundUser) => {
    console.log(user)
    if (foundUser) {
      User.findOneAndUpdate({id: user.discordID}, {
        $set: {factorioName: user.factorioName, factorioRoles: ["Member"]}
      // }).then((user) => console.log(`UPDATED ${user}`))
      })
    } else {
      User.create({
        id: user.discordID,
        factorioName: user.factorioName,
        factorioRoles: ["Member"]
      // }).then((user) => console.log(`ADDED ${user}`))
      })
    }
    const guild = client.guilds.cache.get("548410604679856151")
    guild.members.fetch(user.discordID).then((duser) => {
      console.log(user, duser)
      if (duser) {
        duser.roles.add("830093188198432819").then(() => console.log(`Added to ${user.discordID} ${Date.now()}`))
      }
    })
  })
  }
  console.log("done")
})