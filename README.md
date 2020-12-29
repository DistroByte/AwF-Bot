# AwF-Bot

This bot is for integration of a Discord server and multiple Factorio servers. It has been programmed tailored to fit [All-Weekend Factorio](awf.yt), but with minor changes, it could probably be fit to your Factorio server(s) too!

---

## `servers.json`

Servers.json is here to easen the job of adding and removing servers. Simply have servers in the format of (remove comments):

## JammyLogger - Factorio integration

To use JammyLogger features, please load the scenario from the `jammy-awf-scenario` folder into a save or copy the folder contents into an existing save. This will allow logging for features such as deaths, rocket launches and research.
To include it in an existing **VANILLA** save:

- unzip the latest save
- get the `control.lua` and `scripts` from `/opt/factorio/AwF-Bot-Test/freeplay-jlogger`
- paste them into the unzipped save (replace default `control.lua` with the modified one
- zip back up and restore from that save (?restoresave works fine for that, you may need to start it up by connecting though)

Another option is to load `oof2win2's` mod that does this all without the hassle. It however **doesn't allow for achievements to work**, as the game stores modded and vanilla achievements separately, modded ones don't go to Steam.

If you would prefer the integration with permissions for different types of user levels, please use the [AwF-Scenario](https://github.com/oof2win2/AwF-Scenario)

## Commands

To add a new command, please view the existing commands in the `commands` folder or view the documented example in `examples/command.example.js`. If you want to create a new category of commands, you need to add the category into the `handlers/command.js` file.
