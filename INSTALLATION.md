# Installation Guide

## Prerequisites

- A MongoDB instance. You can either create your own or get a free instance of Atlas (hosted on AWS/Google Cloud) [here](https://docs.atlas.mongodb.com/getting-started/). The free instance is probably better than required for this project, haven't had any issues with that
- A Discord application. Create one [here](https://discord.com/developers/applications). [This guide](https://www.freecodecamp.org/news/create-a-discord-bot-with-javascript-nodejs/) also seems pretty fine, follow it only until you have the bot invited. Make sure you copy the bot token for later use
- At least one Factorio server. If you have multiple, make sure that they are **in the same directory**
- Node v14
- Factorio servers to have [factorio-init](https://github.com/Bisa/factorio-init) installed

### How to install factorio-init

1. Clone https://github.com/Bisa/factorio-init to any directory that you wish
2. Make a directory where all of your Factorio servers will be located, such as `/opt/factorio/servers/`
3. Go to the directory where you cloned factorio-init into and copy `config.example` to `config`
4. Set the config up
   1. Make sure to set `SERVICE_NAME` to whatever you will recognize in the future, for example `Factorio-AWF-Regular`
   2. Make sure the `USERNAME` and `USERGROUP` are properly configured to the user profile that is able to start, stop Factorio servers and is the same as the one that Jammy will use
   3. Set `FACTORIO_PATH` to a folder in the directory you created for your Factorio servers, such as `/opt/factorio/servers/awf-regular`. Make sure you create this directory. This must be new and not the directory of an old server. You can copy savefiles, mods etc. later
   4. Set `INSTALL_CACHE_DIR=/tmp` to wherever downloads of Factorio server tarballs can be cached, or disable by toggling `INSTALL_CACHE_TAR`
   5. Download the [factorio-updater](https://github.com/narc0tiq/factorio-updater) script to a place that you will remember. It can be common for multiple servers. Then set the `UPDATE_SCRIPT` to the location of the python script
   6. Set `RCON_PORT` and `RCON_PASSWORD` (you will need to manually type those in) to whatever you will have in Jammy. Make the password consistent for all servers.
   7. Add `--rcon-port ${RCON_PORT} --rcon-password ${RCON_PASSWORD}` to the `EXTRA_BINARGS` field
5. Run `./factorio install` and factorio-init will install Factorio to the directory that you specified previously.
6. Copy the whole cloned `factorio-init` directory to the Factorio server's directory, i.e. `/opt/factorio/servers/awf-regular/factorio-init`
7. Move to the server's directory and either copy in files from your old server, or set the Factorio server up freshly. Make sure you set your token/password in the `server-settings.json` file
8. Run `./factorio-init/factorio start` to start the server. Refer to [the factorio-init docs](https://github.com/Bisa/factorio-init) for reference about further usage, however some parts are managed by Jammy.

## Bot Installation

1. Clone the repository and install dependencies with `git clone https://github.com/DistroByte/AwF-Bot && cd AwF-Bot && npm i`
2. Populate your `config.js` file from the example (`config.example.js`)
3. Populate your `servers.js` file from the example (`servers.example.js`)
4. If files like `script-output/ext/awflogging.out` don't exist in your Factorio server folders, make sure they exist. All of the file names are in [config.example.js](config.example.js#L38). They can be blank.
5. Optimally, install the [Discord integration mod](https://mods.factorio.com/mod/Factorio-Discord-BotIntegration/discussion/60e4b5bf4b7e496a4faed8d1) for an easy setup, or for more features, install the [scenario for Factorio](https://github.com/explosivegaming/scenario/) onto each server as a scenario, as it has more features
6. Set the database up with `npx prisma generate && npx prisma db push`
7. Run with `node .` or using PM2
