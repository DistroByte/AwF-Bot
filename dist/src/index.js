"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const fs_1 = (0, tslib_1.__importDefault)(require("fs"));
const promises_1 = require("fs/promises");
const mongoose_1 = (0, tslib_1.__importDefault)(require("mongoose"));
const Comfy_1 = (0, tslib_1.__importDefault)(require("./base/Comfy"));
const client = new Comfy_1.default({});
require("./helpers/sqlitedb");
setTimeout(require("./helpers/migratebans"), 10000);
// remove all files from ./temp/ dir to prevent random bs
try {
    if (!fs_1.default.existsSync("./temp/"))
        fs_1.default.mkdirSync("./temp");
    let tempFiles = fs_1.default.readdirSync("./temp/");
    tempFiles.forEach((file) => {
        fs_1.default.rmSync(`./temp/${file}`);
        console.log(`File ./temp/${file} removed!`);
    });
}
catch (error) {
    console.error(error);
}
const init = async () => {
    // Loads commands
    const dirs = await (0, promises_1.readdir)("./commands/");
    dirs.forEach(async (dir) => {
        const cmds = await (0, promises_1.readdir)(`./commands/${dir}/`);
        cmds
            .filter((cmd) => cmd.split(".").pop() === "js")
            .forEach((cmd) => {
            const res = client.loadCommand(`./commands/${dir}`, cmd);
            if (res)
                client.logger(res, "error");
        });
    });
    // Loads events
    const evtDirs = await (0, promises_1.readdir)("./events/");
    evtDirs.forEach(async (dir) => {
        const evts = await (0, promises_1.readdir)(`./events/${dir}/`);
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
    mongoose_1.default
        .connect(client.config.mongoDB)
        .then(() => {
        client.logger("Database connected", "log");
    })
        .catch((err) => client.logger("Error connecting to database. Error:" + err, "error"));
    mongoose_1.default
        .createConnection(client.config.mongoDB).asPromise()
        .then((connection) => connection.useDb("scenario"))
        .then((connection) => {
        client.logger("Second database connected", "log");
    })
        .catch((err) => client.logger("Error connecting to database. Error:" + err, "error"));
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
const fifo_handler_1 = (0, tslib_1.__importDefault)(require("./helpers/fifo-handler"));
const Tails_1 = (0, tslib_1.__importDefault)(require("./base/Tails"));
fifo_handler_1.default.client = client;
Tails_1.default.client = client;
// load Prometheus server for data stuff
require("./base/Prometheus");
// load server-based Prometheus stuff
require("./base/GrafanaHandler");
//# sourceMappingURL=index.js.map