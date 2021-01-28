const {
    deleteManyDB,
    getServerFromChannelInput,
    sortModifiedDate,
    runShellCommand,
    sendToPastebin
} = require("../../functions");
const { clientErrChannelID, absPath } = require("../../botconfig.json");
const fs = require("fs");
const child_process = require("child_process")
const { MessageEmbed } = require("discord.js")
const https = require("https");
const Str = require("@supercharge/strings");

module.exports = {
    config: {
        name: "resetserver",
        aliases: [""],
        usage: "<server channel ping>",
        category: "moderator",
        description: "Resets a Factorio server. If an attatchment ending in .json is included, "
            + "it is parsed as server startup settings. To get an example, please run the command without parameters",
        accessableby: "Moderators",
    },
    run: async (client, message, args) => {
        let authRoles = message.member.roles.cache;
        if (
            !authRoles.some((r) => ["Admin", "Moderator", "dev"].includes(r.name))
        ) {
            // if user is not Admin/Moderator/dev
            return message.channel.send(
                "You don't have enough priviliges to run this command!"
            );
        }

        if (!args[0]) {
            let embed = new MessageEmbed()
                .setTitle("Server Reset Help")
                .setColor("GREEN")
                .setDescription("Available flags")
                .setAuthor(
                    `${message.guild.me.displayName} Help`,
                    message.guild.iconURL
                )
                .setThumbnail(client.user.displayAvatarURL())
                .setFooter(
                    `© ${message.guild.me.displayName} | Developed by DistroByte & oof2win2 | Total Commands: ${client.commands.size}`,
                    client.user.displayAvatarURL()
                );
            embed.addField("`--scenario`", "Use a downloaded scenario. Use such as `--scenario AwF-Scenario`");
            embed.addField("Map Settings", "To provide map settings, refer to the example attatched. To use a non-default map setting, just attatch it to your message");
            embed.addField("Map Settings Example", "[Example Map Settings file download](https://www.dropbox.com/s/06rzqwbngh74rqt/mapsettings.json?dl=1)")
            return message.channel.send(embed);
        }


        let jammyOutChannel = await client.channels.fetch(clientErrChannelID);

        let serverObject = getServerFromChannelInput(message.mentions.channels.first().id);

        if (!message.mentions.channels.first())
            return message.channel.send("Please mention a channel to wipe!");

        let sentMsg = await message.channel.send(
          `Please confirm wiping of server <#${
            message.mentions.channels.first().id
          }> within 10s`
        );
        sentMsg.react("✅");
        sentMsg.react("❌");
        const filter = (reaction, user) => {
          return user.id === message.author.id;
        };
        try {
          let messageReaction = await sentMsg
            .awaitReactions(filter, {
              max: 1,
              time: 10000,
              errors: ["time"],
            })
            .catch((err) => {
              if (err.size == 0)
                return message.channel.send("Didn't reply in time");
              jammyOutChannel.send(`Error. ${err.name}\n\`\`\`\n${err}\n\`\`\``);
              throw err;
            });
          let reaction = messageReaction.first();
          if (reaction.emoji.name === "❌")
            return message.channel.send("Wiping cancelled");
        } catch (err) {
          if (err.size == 0)
            return message.channel.send("Didn't react fast enough!");
          else {
            message.channel.send("Error getting message reaction")
            jammyOutChannel.send(`Error. \`${err.description}\`\n\`\`\`${err}\`\`\``)
            // console.log(err);
            throw err
          }
        }

        // temp file paths to delete later
        let tempFiles = [];

        // stop the server
        await runShellCommand(`${absPath}/${serverObject.serverFolderName}/factorio-init/factorio stop`)
            .catch((e) => {
                return message.channel.send(`Error stopping server: \`${e}\``);
            });

        // wiping server statistics
        try {
            await deleteManyDB(serverObject.discordChannelName, "stats", {
                research: "researchData",
            });
            await deleteManyDB(serverObject.discordChannelName, "deaths", {
                player: { $exists: true },
            });
        } catch (error) {
            message.channel.send("Error wiping server stats");
            jammyOutChannel.send(`Error. ${error.name}\n\`\`\`\n${error}\n\`\`\``);
            throw error;
        }

        // save stuff
        saveStuff: try {
            let saves = await sortModifiedDate(
                `${absPath}/${serverObject.serverFolderName}/saves`
            );
            // no saves to process
            if (saves[0] == undefined) break saveStuff;

            // if server's directory in ~/archive/ doesn't exist, make it
            // use process.env.HOME instead of ~ as node doesn't transfer '~' to the user's home dir path
            if (!fs.existsSync(`${process.env.HOME}/archive/${serverObject.serverFolderName}`))
                fs.mkdirSync(`${process.env.HOME}/archive/${serverObject.serverFolderName}`);

            // copy the latest save to ~/archive/<serverFolderName>
            fs.copyFileSync(
                `${absPath}/${serverObject.serverFolderName}/saves/${saves[0]}`,
                `${process.env.HOME}/archive/${serverObject.serverFolderName}/${saves[0]}`
            );

            // remove the /opt/factorio/servers/<server>/saves directory (whole)
            if (!fs.existsSync(`${absPath}/${serverObject.serverFolderName}/saves/`))
                fs.mkdirSync(`${absPath}/${serverObject.serverFolderName}/saves/`);
            let saveFiles = fs.readdirSync(`${absPath}/${serverObject.serverFolderName}/saves/`);
            saveFiles.forEach(file => {
                fs.rmSync(`${absPath}/${serverObject.serverFolderName}/saves/${file}`, { force: true, recursive: true });
            });
        } catch (error) {
            message.channel.send("Error moving latest save to archive")
            jammyOutChannel.send(`Error. ${error.name}\n\`\`\`\n${error}\n\`\`\``);
            throw error;
        }

        commandArgs = []
        command = `cd ${absPath}/${serverObject.serverFolderName} && ${absPath}/${serverObject.serverFolderName}/bin/x64/factorio`
        if (args.includes("--scenario")) {
            // user wants to start with a scenario
            let index = args.indexOf("--scenario")
            let scenarioName = args[index + 1]
            commandArgs.push(`--start-server-load-scenario`, `${scenarioName}`);
        } else commandArgs.push("--create", "saves/map");

        // if a map settings file has been attatched (any .json file), add it as a argument
        if (message.attachments.first()) {
            let file = message.attachments.first();
            if (file.name.endsWith(".json")) {
                let settingsFilename = Str.random();
                tempFiles.push(`${process.env.PWD}/temp/${settingsFilename}.json`)
                var outFile = fs.createWriteStream(`${process.env.PWD}/temp/${settingsFilename}.json`);
                https.get(file.url, function (response) {
                    response.pipe(outFile);
                    outFile.on('finish', function () {
                        outFile.close();
                    });
                });
                commandArgs.push(`--map-gen-settings`, `${process.env.PWD}/temp/${settingsFilename}.json`)
            }
        }

        // spawn a new child slave to run the server setup
        let server = child_process.spawn('./bin/x64/factorio', commandArgs, { cwd: `${absPath}/${serverObject.serverFolderName}` });
        let outputData = [];
        const serverStartRegExp = new RegExp(/Info ServerMultiplayerManager.cpp:\d\d\d: Matching server connection resumed/);
        server.stdout.on("data", (data) => {
            // console.log(data.toString().slice(0, -1));
            outputData.push(`${data.toString().slice(0, -1)}`);
            if (data.toString().slice(0, -1).match(serverStartRegExp)) {
                server.kill();
                message.channel.send(`Server <#${serverObject.discordChannelID}> generated a new map`);
            }
        });
        server.stderr.on("data", (data) => {
            // console.log(data.toString().slice(0, -1));
            outputData.push(`${data.toString().slice(0, -1)}\n`);
        });
        server.on("close", async (code) => {
            let msg = outputData.join("\n");
            let outFilePath = `${process.env.PWD}/temp/${Str.random()}.out`;
            tempFiles.push(outFilePath);
            fs.writeFileSync(outFilePath, msg);
            await message.channel.send(`Process exited with code ${code}. Output is as an attatchment.`, { files: [outFilePath] });

            tempFiles.forEach(fileName => { fs.rmSync(fileName) });
            message.channel.send("Starting server back up...");

            runShellCommand(
                `${absPath}/${serverObject.serverFolderName}/factorio-init/factorio start`
            ).catch((e) => {
                return message.channel.send(`Error starting: \`${e}\``);
            });
            setTimeout(() => {
                runShellCommand(`${absPath}/${serverObject.serverFolderName}/factorio-init/factorio status`)
                    .catch((e) => {
                        return message.channel.send(`Error statusing: \`${e}\``);
                    })
                    .then((out) => {
                        return message.channel.send(`Server status: \`${out}\``);
                    });
            }, 5000);
        });
        setTimeout(() => {
            if (server.exitCode === null) {
                server.kill();
                // console.log("Killed after 60s!");
                message.channel.send(`Server <#${serverObject.discordChannelID}> killed after 60s with force`);
                jammyOutChannel.send(`Server <#${serverObject.discordChannelID}> killed after 60s with force`);
                setTimeout(() => {
                    if (server.exitCode === null) {
                        server.kill()
                        message.channel.send(`Server <#${serverObject.discordChannelID}> killed after another 15s with force`);
                        jammyOutChannel.send(`Server <#${serverObject.discordChannelID}> killed after another 15s with force`);
                    }
                }, 15000);
            }
        }, 60000);
    },
};
