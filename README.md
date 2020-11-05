# AwF-Bot
This bot is for integration of a Discord server and multiple Factorio servers. It has been programmed tailored to fit [All-Weekend Factorio](awf.yt), but with minor changes, it could probably be fit to your Factorio server(s) too!


---

## `servers.json`
Servers.json is here to easen the job of adding and removing servers. Simply have servers in the format of (remove comments):
```
{
    "dev-dump": { //the name of the server, same as the discordChannelName
        "name": "TEST",     //name in debugging
        "discordChannelID": "723280139982471247",   //discord channel id
        "discordChannelName": "dev-dump",           //discord channel name
        "serverOut": "../servers/test/server.out",  //the server.out file of the server
        "serverFifo": "../servers/test/server.fifo" //the server.fifo file of the server
    }
}
```
To use JLOGGER features, please load the scenario from the `freeplay-jlogger` folder or copy its contents into an existing save. This will allow logging for features such as deaths, rocket launches and research.
To include it in an existing save:
so first: unzip the latest save
second: get the `control.lua` and `scripts` from `/opt/factorio/AwF-Bot-Test/freeplay-jlogger`
third: paste them into the unzipped save (replace default `control.lua` with the modified one
fourth: zip back up and restore from that save (?restoresave works fine for that, you may need to start it up by connecting though)

