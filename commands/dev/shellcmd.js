const child_process = require("child_process");
const Str = require("@supercharge/strings");
const fs = require('fs');
const { ErrorManager } = require("../../utils/error-manager");

module.exports = {
    config: {
        name: "shellcmd",
        aliases: [],
        usage: "<shell command>",
        category: "dev",
        description: "Execute a shell command",
        accessableby: "Dev",
    },
    run: async (client, message, args) => {
        let authRoles = message.member.roles.cache;
        if (
            !authRoles.some((r) => ["Admin", "dev"].includes(r.name))
        ) {
            // if user is not Admin/Moderator/dev
            return message.channel.send(
                "You don't have enough priviliges to run this command!"
            );
        }
        if (!args[0]) return message.channel.send('No command!');
        const initialCmd = args.shift();
        let outputData = [];
        let child = child_process.spawn(initialCmd, args);
        child.stdout.on("data", (data) => {
          outputData.push(`${data.toString().slice(0, -1)}`);
        });
        child.stderr.on("data", (data) => {
          outputData.push(`${data.toString().slice(0, -1)}\n`);
        });
        child.on("close", async (code) => {
          let msg = outputData.join("\n");
          let outFilePath = `${process.env.PWD}/temp/${Str.random()}.out`;
          fs.writeFileSync(outFilePath, msg);
          try {
            await message.channel.send(`Process exited with code ${code}. Output is as an attatchment.`, { files: [outFilePath] });
          } catch (error) {
            message.channel.send(`Error: ${error}`);
            ErrorManager.Error(error);
          }
          fs.rmSync(outFilePath);
        });
        setTimeout(() => {
          if (child.exitCode === null) {
            child.kill();
            // console.log("Killed after 60s!");
            message.channel.send(`Command killed after 5s`);
            setTimeout(() => {
              if (child.exitCode === null) {
                child.kill()
                message.channel.send(`Command killed after another 500ms with force`);
              }
            }, 500);
          }
        }, 5000);
    },
};
