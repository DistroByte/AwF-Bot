# AwF-Bot

This bot is for integration of a Discord server and multiple Factorio servers. It has been programmed tailored to fit [All-Weekend Factorio](awf.yt), but with minor changes, it could probably be fit to your Factorio server(s) too!

---

## `servers.json`

Servers.json is here to easen the job of adding and removing servers. Simply have servers in the format of (remove comments):

```
{
	"_comment_Name": "the name of the server, same as the discordChannelName",
"dev-dump": {
	    "_comment_Name2" : "name in debugging when logging messages to console",
        "name": "TEST",
        "_comment_DiscordChannelID": "discord channel id",
        "discordChannelID": "723280139982471247",
        "_comment_DiscordChannelName": "discord channel name",
        "discordChannelName": "dev-dump",
        "_comment_serverOut": "the server.out file of the server",
        "serverOut": "../servers/test/server.out",
        "_comment_serverFifo": "the server.fifo file of the server",
        "serverFifo": "../servers/test/server.fifo",
        "_comment_serverFolderName": "the name of the folder of the server, where the server is running",
        "serverFolderName": "test"
    }
}
```

## JammyLogger

To use JammyLogger features, please load the scenario from the `jammy-awf-scenario` folder or copy the folder contents into an existing save. This will allow logging for features such as deaths, rocket launches and research.
To include it in an existing **VANILLA** save:

- unzip the latest save
- get the `control.lua` and `scripts` from `/opt/factorio/AwF-Bot-Test/freeplay-jlogger`
- paste them into the unzipped save (replace default `control.lua` with the modified one
- zip back up and restore from that save (?restoresave works fine for that, you may need to start it up by connecting though)

Another option is to load `oof2win2's` mod that does this all without the hassle. It however **doesn't allow for achievements to work**, as the game stores modded and vanilla achievements separately, modded ones don't go to Steam.
