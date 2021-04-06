const mongoose = require('mongoose');

module.exports = mongoose.model('Member', new mongoose.Schema({

  id: { type: String },
  guildID: { type: String },

  money: { type: Number, default: 0 },
  workStreak: { type: Number, default: 0 },
  bankSold: { type: Number, default: 0 },
  xp: { type: Number, default: 0 },

  registeredAt: { type: Number, default: Date.now() }, // Registered date of the member

  cooldowns: {
    type: Object, default: {
      work: 0,
      rob: 0
    }
  },

  sanctions: { type: Array, default: [] }, // Array of the member sanctions (mute, ban, kick, etc...)
  mute: {
    type: Object, default: { // The member mute infos
      muted: false,
      case: null,
      endDate: null
    }
  },

}));