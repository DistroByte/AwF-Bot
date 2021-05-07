const mongoose = require("mongoose")
const config = require("./config")
const User = require("./base/User")

mongoose.connect(config.mongoDB, config.dbOptions).then(async () => {
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
      }).then((user) => console.log(`UPDATED ${user}`))
    } else {
      User.create({
        id: user.discordID,
        factorioName: user.factorioName,
        factorioRoles: ["Member"]
      }).then((user) => console.log(`ADDED ${user}`))
    }
  })
  }
  console.log("done")
  mongoose.disconnect()
})