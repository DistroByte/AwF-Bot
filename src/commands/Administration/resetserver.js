const { MessageEmbed, MessageAttachment } = require("discord.js");
const Command = require("../../base/Command.js");
const serverJS = require("../../servers");
const {
  sortModifiedDate,
  runShellCommand,
} = require("../../helpers/functions");
const childprocess = require("child_process");
const fs = require("fs");
const moment = require("moment");
const ServerStatistics = require("../../base/Serverstatistics");
const minimist = require("minimist");
const Str = require("@supercharge/strings");
const https = require("https");

class Linkme extends Command {
  constructor(client) {
    super(client, {
      name: "resetserver",
      description: "Reset a Factorio server and back up a save to Mega",
      usage:
        "<#channel> [--scenario <Scenario name>][File attatchment for map gen settings]",
      examples: [
        "{{p}}resetserver <#724696348871622818> --scenario AwF-Scenario",
      ],
      dirname: __dirname,
      enabled: true,
      guildOnly: false,
      aliases: [],
      memberPermissions: ["ADMINISTRATOR"],
      botPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
      nsfw: false,
      ownerOnly: false,
      cooldown: 5000,
      customPermissions: ["MANAGE_SERVER"],
    });
  }

  async run(message, args) {
    if (!message.mentions.channels.first())
      return message.reply("No channel to reset provided!");
    args.shift(); // remove mention
    let server = serverJS.find(
      (server) => server.discordid === message.mentions.channels.first().id
    );
    if (!server) return message.reply("Invalid channel, not tied to a server!");

    // stop server
    childprocess.spawnSync(`./factorio-init/factorio`, ["stop"], {
      cwd: `${this.client.config.serverpath}/${server.path}`,
    });

    // back up saves
    const saves = fs
      .readdirSync(`${this.client.config.serverpath}/${server.path}/saves`)
      .map(
        (save) =>
          `${this.client.config.serverpath}/${server.path}/saves/${save}`
      );
    const latestSavePath = saves[0];
    // if there are saves, back up latest and remove all after
    if (latestSavePath) {
      const latestSave = latestSavePath.slice(
        latestSavePath.lastIndexOf("/") + 1,
        latestSavePath.indexOf(".")
      );
      if (!fs.existsSync(`${this.client.config.archivePath}/${server.path}/`))
        fs.mkdirSync(`${this.client.config.archivePath}/${server.path}/`);
      fs.copyFileSync(
        latestSavePath,
        `${this.client.config.archivePath}/${
          server.path
        }/${latestSave}_${moment().format("YYYY-MM-DD-mm-ss")}.zip`
      );
      saves.forEach((savePath) => fs.rmSync(savePath));
    }

    // remove stats
    ServerStatistics.findOneAndReplace(
      { serverID: server.discordid },
      {
        serverID: server.discordid,
        serverName: server.name,
      }
    ).then(() => {});

    let cmdArgs = minimist(args);
    let command = "";
    // add scenario / map to command
    if (cmdArgs["scenario"]) {
      command = `--start-server-load-scenario ${cmdArgs["scenario"]}`;
      delete cmdArgs["scenario"]; // remove scenario
    } else command = `--create saves/map`;

    // add any other arguments to command
    Object.keys(cmdArgs).forEach((key) => {
      if (key === "_") return;
      if (typeof cmdArgs[key] === "boolean") command = `${command} --${key}`;
      else command = `${command} --${key} ${cmdArgs[key]}`;
    });
    let tempFiles = [];
    if (message.attachments.first()) {
      let file = message.attachments.first();
      if (file.name.endsWith(".json")) {
        let settingsFilename = Str.random();
        tempFiles.push(`${process.env.PWD}/temp/${settingsFilename}.json`);
        var outFile = fs.createWriteStream(
          `${process.env.PWD}/temp/${settingsFilename}.json`
        );
        https.get(file.url, function (response) {
          response.pipe(outFile);
          outFile.on("finish", function () {
            outFile.close();
          });
        });
        command = `${command} --map-gen-settings ${process.env.PWD}/temp/${settingsFilename}.json`;
      }
    }
    command = `${command} ${cmdArgs._}`.trim();

    const reactionFilter = (reaction, user) => user.id === message.author.id;
    const confirm = await message.channel.send(
      `Are you sure you want to reset your server with this command?\n\`bin/x64/factorio ${command}\``
    );
    confirm.react("✅");
    confirm.react("❌");
    let reactions;
    try {
      reactions = await confirm.awaitReactions(reactionFilter, {
        max: 1,
        time: 120000,
      });
    } catch {
      return message.channel.send("Error getting reaction");
    }
    let reaction = reactions.first();
    if (reaction.emoji.name === "❌")
      return message.channel.send("Server reset cancelled");
    if (reaction.emoji.name !== "✅")
      return message.channel.send("Wrong emoji");

    let output = [];
    const serverStartRegExp = new RegExp(
      /Info ServerMultiplayerManager.cpp:\d\d\d: Matching server connection resumed/
    );
    let factorio = childprocess.spawn(
      `./bin/x64/factorio`,
      command.split(" "),
      { cwd: `${this.client.config.serverpath}/${server.path}` }
    );
    const handleMessage = (msg) => {
      let data = msg.toString().trim();
      console.log(data);
      output.push(data);
      if (data.match(serverStartRegExp)) {
        tempFiles.forEach((filepath) => fs.rmSync(filepath));
        factorio.kill();
        // roles are synced in the server handler so there is no wait for them to load
        this.client.factorioServers.find((clientServer) => {
          if (clientServer.discordid === server.discordid) {
            clientServer.roleSync = true;
            return true;
          }
        });
      }
    };
    factorio.stdout.on("data", handleMessage);
    factorio.stderr.on("data", handleMessage);
    factorio.on("close", (code) => {
      let msg = output.join("\n");
      let file = new MessageAttachment(Buffer.from(msg), "output.txt");
      message.channel.send(
        `Process exited with code ${code}. Starting server back up. Roles will sync shortly`,
        { files: [file] }
      );
      childprocess.spawn(`./factorio-init/factorio`, ["start"], {
        detatched: true,
        cwd: `${this.client.config.serverpath}/${server.path}`,
      });
      setTimeout(() => {
        runShellCommand(
          `${this.client.config.serverpath}/${server.path}/factorio-init/factorio status`
        )
          .then((out) => {
            return message.channel.send(`Server status: \`${out}\``);
          })
          .catch((e) => {
            return message.channel.send(`Error statusing: \`${e}\``);
          });
      }, 5000);
    });
  }
}

module.exports = Linkme;
