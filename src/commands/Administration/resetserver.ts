import { MessageEmbed, MessageAttachment, Message } from "discord.js";
import { Command } from "../../base/Command.js";
import serverJS from "../../servers";
import { sortModifiedDate, runShellCommand } from "../../helpers/functions";
import childprocess from "child_process";
import fs from "fs";
import moment from "moment";
import ServerStatistics from "../../base/Serverstatistics";
import minimist from "minimist";
import Str from "@supercharge/strings";
import https from "https";

const Resetserver: Command<Message> = {
  name: "resetserver",
  description: "Reset a Factorio server and back up a save to Mega",
  usage:
    "<#channel> [--scenario <Scenario name>][File attatchment for map gen settings]",
  category: "Administration",
  examples: ["{{p}}resetserver <#724696348871622818> --scenario AwF-Scenario"],
  dirname: __dirname,
  enabled: true,
  guildOnly: false,
  aliases: [],
  memberPermissions: ["ADMINISTRATOR"],
  botPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
  nsfw: false,
  ownerOnly: false,
  customPermissions: ["MANAGE_SERVER"],
  run: async ({ client, message, args }) => {
    if (!message.mentions.channels.first())
      return message.reply("No channel to reset provided!");
    args.shift(); // remove mention
    let server = serverJS.find(
      (server) => server.discordid === message.mentions.channels.first().id
    );
    if (!server) return message.reply("Invalid channel, not tied to a server!");

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

    const confirm = await message.channel.send(
      `Are you sure you want to reset your server with this command?\n\`bin/x64/factorio ${command}\``
    );
    confirm.react("✅");
    confirm.react("❌");
    let reactions;
    try {
      reactions = await confirm.awaitReactions({
        max: 1,
        time: 120000,
        filter: (reaction, user) => user.id === message.author.id,
      });
    } catch {
      return message.channel.send("Error getting reaction");
    }
    let reaction = reactions.first();
    if (reaction.emoji.name === "❌")
      return message.channel.send("Server reset cancelled");
    if (reaction.emoji.name !== "✅")
      return message.channel.send("Wrong emoji");

    // stop server
    childprocess.spawnSync(`./factorio-init/factorio`, ["stop"], {
      cwd: `${client.config.serverpath}/${server.path}`,
    });

    // back up saves
    const saves = fs
      .readdirSync(`${client.config.serverpath}/${server.path}/saves`)
      .map(
        (save) => `${client.config.serverpath}/${server.path}/saves/${save}`
      );
    const latestSavePath = sortModifiedDate(saves)[0].path;
    // if there are saves, back up latest and remove all after
    if (latestSavePath) {
      const latestSave = latestSavePath.slice(
        latestSavePath.lastIndexOf("/") + 1,
        latestSavePath.indexOf(".")
      );
      if (!fs.existsSync(`${client.config.archivePath}/${server.path}/`))
        fs.mkdirSync(`${client.config.archivePath}/${server.path}/`);
      fs.copyFileSync(
        latestSavePath,
        `${client.config.archivePath}/${
          server.path
        }/${latestSave}_${moment().format("YYYY-MM-DD-mm-ss")}.zip`
      );
      saves.forEach((savePath) => fs.rmSync(savePath));
    }

    // remove stats
    ServerStatistics.findOneAndDelete({ serverID: server.discordid }).then(
      () => {
        ServerStatistics.create({
          serverID: server.discordid,
          serverName: server.name,
        });
      }
    );

    let output = [];
    const serverStartRegExp = new RegExp(/Hosting game at IP ADDR/);
    let factorio = childprocess.spawn(
      `./bin/x64/factorio`,
      command.split(" "),
      { cwd: `${client.config.serverpath}/${server.path}` }
    );
    const handleMessage = (msg) => {
      let data = msg.toString().trim();
      console.log(data);
      output.push(data);
      if (data.match(serverStartRegExp)) {
        tempFiles.forEach((filepath) => fs.rmSync(filepath));
        factorio.kill();
      }
    };
    factorio.stdout.on("data", handleMessage);
    factorio.stderr.on("data", handleMessage);
    factorio.on("close", (code) => {
      let msg = output.join("\n");
      let file = new MessageAttachment(Buffer.from(msg), "output.txt");
      message.channel.send({
        files: [file],
        content: `Process exited with code ${code}. Starting server back up. Roles will sync shortly`,
      });
      childprocess.spawn(`./factorio-init/factorio`, ["start"], {
        detached: true,
        cwd: `${client.config.serverpath}/${server.path}`,
      });
      setTimeout(() => {
        runShellCommand(
          `${client.config.serverpath}/${server.path}/factorio-init/factorio status`
        )
          .then((out) => {
            return message.channel.send(`Server status: \`${out}\``);
          })
          .catch((e) => {
            return message.channel.send(`Error statusing: \`${e}\``);
          });
      }, 5000);
    });
  },
};

export default Resetserver;
