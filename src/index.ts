import util from "util";
import fs from "fs";
import { readdir } from "fs/promises";
import mongoose from "mongoose";
import { Intents } from "discord.js";
import Comfy from "./base/Comfy";
import rcon from "./helpers/rcon";

const client = new Comfy({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
    Intents.FLAGS.GUILD_INVITES,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    Intents.FLAGS.GUILD_PRESENCES,
    Intents.FLAGS.GUILD_WEBHOOKS,
    Intents.FLAGS.GUILD_MEMBERS,
  ],
});

process.chdir(__dirname);

require("./helpers/sqlitedb");

import refreshbanlist from "./helpers/migratebans";
setTimeout(refreshbanlist, 10000);

// remove all files from ./temp/ dir to prevent random bs
try {
  if (!fs.existsSync("./temp/")) fs.mkdirSync("./temp");
  let tempFiles = fs.readdirSync("./temp/");
  tempFiles.forEach((file) => {
    fs.rmSync(`./temp/${file}`);
    console.log(`File ./temp/${file} removed!`);
  });
} catch (error) {
  console.error(error);
}

const init = async () => {
  // Loads commands
  const dirs = await readdir("./commands/");
  dirs.forEach(async (dir) => {
    const cmds = await readdir(`./commands/${dir}/`);
    cmds
      .filter((cmd) => cmd.split(".").pop() === "js")
      .forEach((cmd) => {
        client
          .loadCommand(`./commands/${dir}`, cmd)
          .then((r) => r && client.logger(r, "error"));
      });
  });

  // Loads events
  const evtDirs = await readdir("./events/");
  evtDirs.forEach(async (dir) => {
    const evts = await readdir(`./events/${dir}/`);
    evts
      .filter((evt) => evt.endsWith(".js"))
      .forEach(async (evt) => {
        const evtName = evt.split(".")[0];
        const event = await import(`./events/${dir}/${evt}`);
        client.on(evtName, (...args) => event.default(client, ...args));
        delete require.cache[require.resolve(`./events/${dir}/${evt}`)];
      });
  });

  client.login(client.config.token);

  rcon.client = client;
  const serverHandler = (await import("./helpers/serverHandler")).default;
  const servers = new serverHandler(client);
  rcon.serverConnected = (server) => servers.startHandler(server);

  mongoose
    .connect(client.config.mongoDB)
    .then(() => {
      client.logger("Database connected", "log");
    })
    .catch((err) =>
      client.logger("Error connecting to database. Error:" + err, "error")
    );
  mongoose
    .createConnection(client.config.mongoDB)
    .asPromise()
    .then((connection) => connection.useDb("scenario"))
    .then((connection) => {
      client.logger("Second database connected", "log");
    })
    .catch((err) =>
      client.logger("Error connecting to database. Error:" + err, "error")
    );
};

init();

client
  .on("disconnect", () => client.logger("Bot is disconnecting...", "warn"))
  .on("reconnecting", () => client.logger("Bot reconnecting...", "log"))
  .on("error", (e) => client.logger(e, "error"))
  .on("warn", (info) => client.logger(info, "warn"));

process.on("unhandledRejection", async (err) => {
  console.error(err);
});

// add client to classes for logging
import "./helpers/logger";
import fifoHandler from "./helpers/fifo-handler";
import Tails from "./base/Tails";
fifoHandler.client = client;
Tails.client = client;

// load Prometheus server for data stuff
import "./base/Prometheus";

// load server-based Prometheus stuff
import "./base/GrafanaHandler";
