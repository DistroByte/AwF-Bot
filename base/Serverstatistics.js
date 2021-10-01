const mongoose = require("mongoose"),
  Schema = mongoose.Schema,
  config = require("../config.js");

module.exports = mongoose.model(
  "ServerStatistics",
  new Schema({
    id: String,
    serverName: {
      type: String,
      required: true,
    },
    serverID: {
      type: String,
      required: true,
    },
    rocketLaunches: { type: Number, required: true, default: 0 },
    completedResearch: [
      {
        name: String,
        level: Number,
      },
    ],
    evolution: {
      big: { type: Boolean, default: false },
      behemoth: { type: Boolean, default: false },
    },
  })
);
