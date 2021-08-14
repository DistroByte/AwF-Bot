# Installation Guide

## Prerequisites
- A MongoDB instance. You can either create your own or get a free instance of Atlas (hosted on AWS/Google Cloud) [here](https://docs.atlas.mongodb.com/getting-started/). The free instance is probably better than required for this project, haven't had any issues with that
- A Discord application. Create one [here](https://discord.com/developers/applications). [This guide](https://www.freecodecamp.org/news/create-a-discord-bot-with-javascript-nodejs/) also seems pretty fine, follow it only until you have the bot invited. Make sure you copy the bot token for later use
- At least one Factorio server. If you have multiple, make sure that they are **in the same directory**
- Node v14

1. Clone the repository and install dependencies with `git clone https://github.com/DistroByte/AwF-Bot && cd AwF-Bot && npm i`
2. Populate your `config.js` file from the example (`config.example.js`)
3. Populate your `servers.js` file from the example (`servers.example.js`)
4. If files like `script-output/ext/awflogging.out` don't exist in your Factorio server folders, make sure they exist. All of the file names are in [config.example.js](config.example.js#L38). They can be blank.
5. Optimally, install the [Discord integration mod](https://mods.factorio.com/mod/Factorio-Discord-BotIntegration/discussion/60e4b5bf4b7e496a4faed8d1) for an easy setup, or for more features, install the [scenario for Factorio](https://github.com/explosivegaming/scenario/) onto each server as a scenario, as it has more features
6. Enjoy!
