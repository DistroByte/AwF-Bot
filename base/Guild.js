const mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  config = require('../config.js');

module.exports = mongoose.model('Guild', new Schema({

  id: { type: String },

  membersData: { type: Object, default: {} },
  members: [{ type: Schema.Types.ObjectId, ref: 'Member' }],

  prefix: { type: String, default: config.prefix },
  plugins: {
    type: Object, default: {
      welcome: {
        enabled: false, // Whether the welcome messages are enabled
        message: null, // The welcome message
        channel: null, // The channel to send the welcome messages
      },
      goodbye: {
        enabled: false, // Whether the goodbye messages are enabled
        message: null, // The goodbye message
        channel: null, // The channel to send the goodbye messages
      },
      autorole: {
        enabled: false, // Whether the autorole is enabled
        role: null // The role to add when a member join the server
      },
      automod: {
        enabled: false, // Whether the auto moderation is enabled
        ignored: [] // The channels in which the auto moderation is disabled
      },
      warnsSanctions: {
        kick: false, // The number of warns required to kick the user
        ban: false // The number of warns required to ban the user
      },
      tickets: {
        enabled: false, // Whether the tickets system is enabled
        category: null // The category for the tickets system
      },
      lockdown: false,
      suggestions: false,
      modlogs: false, // the channel in which the moderation logs (mute, kick, ban, etc...) will be sent
      reports: false,
      logs: false // the channel in which the logs (message deleted, etc...) will be sent
    }
  },

  slowmode: {
    type: Object, default: { // Servers slowmode
      users: [],
      channels: []
    }
  },
  casesCount: { type: Number, default: 0 },
  ignoredChannels: { type: Array, default: [] },
  customCommands: { type: Array, default: [] },
  commands: { type: Array, default: [] },
  autoDeleteModCommands: { type: Boolean, default: false },
  disabledCategories: { type: Array, default: [] }
}))