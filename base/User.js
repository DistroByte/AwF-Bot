const mongoose = require('mongoose');

const genToken = () => {
  let token = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwzy0123456789.-_';
  for (let i = 0; i < 32; i++) {
    token += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return token;
};

const userSchema = new mongoose.Schema({

  id: { type: String },

  rep: { type: Number, default: 0 },
  bio: { type: String },
  birthdate: { type: Number },
  lover: { type: String },

  registeredAt: { type: Number, default: Date.now() },

  cooldowns: {
    type: Object, default: {
      rep: 0
    }
  },

  afk: { type: String, default: null }, // Whether the member is AFK
  reminds: { type: Array, default: [] }, // the reminds of the user
  logged: { type: Boolean, default: false }, // if the user is logged to the dashboard
  apiToken: { type: String, default: genToken() } // the api token of the user
});

userSchema.method('genApiToken', async function () {
  this.apiToken = genToken();
  await this.save();
  return this.apiToken;
});

module.exports = mongoose.model('User', userSchema);