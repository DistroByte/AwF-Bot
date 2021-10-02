import util from "util"
import fs from "fs"
import {readdir} from "fs/promises"
import mongoose from "mongoose"

import Comfy from "./base/Comfy"
const client = new Comfy({});

require("./helpers/sqlitedb");

setTimeout(require("./helpers/migratebans"), 10000);

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
        const res = client.loadCommand(`./commands/${dir}`, cmd);
        if (res) client.logger(res, "error");
      });
  });

  // Loads events
  const evtDirs = await readdir("./events/");
  evtDirs.forEach(async (dir) => {
    const evts = await readdir(`./events/${dir}/`);
    evts.forEach((evt) => {
      const evtName = evt.split(".")[0];
      const event = new (require(`./events/${dir}/${evt}`))(client);
      client.on(evtName, (...args) => event.run(...args));
      delete require.cache[require.resolve(`./events/${dir}/${evt}`)];
    });
  });

  client.login(client.config.token);

  let rcon = require("./helpers/rcon");
  rcon.client = client;
  const serverHandler = require("./helpers/serverHandler");
  const servers = new serverHandler(client);

  mongoose
    .connect(client.config.mongoDB)
    .then(() => {
      client.logger("Database connected", "log");
    })
    .catch((err) =>
      client.logger("Error connecting to database. Error:" + err, "error")
    );
  mongoose
    .createConnection(client.config.mongoDB).asPromise()
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
import fifoHandler from "./helpers/fifo-handler"
import Tails from "./base/Tails"
fifoHandler.client = client;
Tails.client = client;

// load Prometheus server for data stuff
import "./base/Prometheus"

// load server-based Prometheus stuff
import "./base/GrafanaHandler"
