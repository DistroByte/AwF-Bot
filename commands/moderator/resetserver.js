const {
  deleteManyDB,
  getServerFromChannelInput,
  sortModifiedDate,
  runShellCommand,
} = require("../../functions");
const { clientErrChannelID, absPath } = require("../../botconfig.json");
const fs = require("fs");
const child_process = require("child_process")
const { MessageEmbed } = require("discord.js")
const https = require("https");

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

    let serverObject = getServerFromChannelInput(
      message.mentions.channels.first().id
    );

    if (!message.mentions.channels.first())
      return message.channel.send("Please mention a channel  to wipe!");
    
    // reactions disabled for testing
    // let sentMsg = await message.channel.send(
    //   `Please confirm wiping of server <#${
    //     message.mentions.channels.first().id
    //   }> within 10s`
    // );
    // sentMsg.react("✅");
    // sentMsg.react("❌");
    // const filter = (reaction, user) => {
    //   return user.id === message.author.id;
    // };
    // try {
    //   let messageReaction = await sentMsg
    //     .awaitReactions(filter, {
    //       max: 1,
    //       time: 5000,
    //       errors: ["time"],
    //     })
    //     .catch((err) => {
    //       if (err.size == 0)
    //         return message.channel.send("Didn't reply in time");
    //       jammyOutChannel.send(`Error. ${err.name}\n\`\`\`\n${err}\n\`\`\``);
    //       throw err;
    //     });
    //   let reaction = messageReaction.first();
    //   if (reaction.emoji.name === "❌")
    //     return message.channel.send("Wiping cancelled");
    // } catch (err) {
    //   if (err.size == 0)
    //     return message.channel.send("Didn't react fast enough!");
    //   else {
    //     message.channel.send("Error getting message reaction")
    //     jammyOutChannel.send(`Error. \`${err.description}\`\n\`\`\`${err}\`\`\``)
    //     console.log(err);
    //     throw err
    //   }
    // }
    
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
      fs.rmdirSync(`${absPath}/${serverObject.serverFolderName}/saves/`, {force: true, recursive: true});
      // create the directory back for the server to use
      fs.mkdirSync(`${absPath}/${serverObject.serverFolderName}/saves/`);
    } catch (error) {
      message.channel.send("Error moving latest save to archive")
      jammyOutChannel.send(`Error. ${error.name}\n\`\`\`\n${error}\n\`\`\``);
      throw error;
    }

    commandArgs = [
      `--mod-directory ${absPath}/${serverObject.serverFolderName}/mods`,
      `--`
    ]
    command = `cd ${absPath}/${serverObject.serverFolderName} && ${absPath}/${serverObject.serverFolderName}/bin/x64/factorio`
    if (args.includes("--scenario")) {
      // user wants to start with a scenario
      let index = args.indexOf("--scenario")
      let scenarioName = args[index+1]
      commandArgs.push(`--start-server-load-scenario ${scenarioName}`)
      command = `${command} --start-server-load-scenario ${scenarioName}`
    }

    // if a map settings file has been attatched (any .json file), add it as a argument
    if (message.attachments.first()) {
      let file = message.attachments.first();
      if (file.name.endsWith(".json")) {
        var outFile = fs.createWriteStream(`${process.env.PWD}/temp/serverSettings.json`);
        https.get(file.url, function(response) {
          response.pipe(outFile);
          outFile.on('finish', function() {
            outFile.close();
          });
        });
        commandArgs.push(`--map-gen-settings ${process.env.PWD}/temp/serverSettings.json`)
        command = `${command} --map-gen-settings ${process.env.PWD}/temp/serverSettings.json`;
      }
    }

    // spawn a new child slave to run the server setup
    cmd = `bin/x64/factorio`
    // console.log(cmd, commandArgs);
    // let child = child_process.spawn(cmd, commandArgs, {cwd: `${absPath}/${serverObject.serverFolderName}`});
    // let child = child_process.spawn("pwd", [], {cwd: `${absPath}/${serverObject.serverFolderName}`});
    let child = child_process.spawn("bin/x64/factorio", ["--start-server-load-latest"], {cwd: `${absPath}/${serverObject.serverFolderName}`});
    child.stdout.on('data', (data) => {
      console.log(`stdout: ${data}`);
    });
    child.stderr.on('data', (data) => {
      console.log(`stderr: ${data}`);
    });
    // setTimeout(() => {
    //   child.kill()
    //   console.log("killed")
    // }, 10000)
    
    // setTimeout(() => {
    //   try {
    //     let res = child.kill();
    //     if (res == false)
    //       throw new Error("Wasn't able to kill server resetting process succesfully, process still running");
    //   } catch (err) {
    //     message.channel.send(`Error. Process timed out after 10s, PID of \`${child.pid}\``);
    //     jammyOutChannel.send(`Error. Process resetting server <#${serverObject.discordChannelID}> timed out after 10s, PID of \`${child.pid}\``);
    //     return jammyOutChannel.send(`Error description ${err.description}\n\`\`\`${err}\`\`\``);
    //   }
    // }, 10000);
  },
};


    // child.on("close", (code) => {
    //   message.channel.send(`Reset server <#${serverObject.discordChannelID}>. Close code ${code}`)
    //   return jammyOutChannel.send(`Reset server <#${serverObject.discordChannelID}>. Close code ${code}`)
    // });
    // child.on("exit", (code) => {
    //   message.channel.send(`Reset server. Exit code ${code}`)
    //   jammyOutChannel.send(`Reset server <#${serverObject.discordChannelID}>. Exit code ${code}`)
    // });
    // child.on("message", (msg) => console.log(msg));