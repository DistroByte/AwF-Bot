# AwF-Bot
This bot is for integration of a Discord server and multiple Factorio servers. It has been programmed tailored to fit [All-Weekend Factorio](awf.yt), but with minor changes, it could probably be fit to your Factorio server(s) too!

---
## `serversetup.py`
When run, `serversetup.py` will give a choice of which server to reset. It will copy the latest game save to the user specified folder, a directory above. The saves can then be synced with a program such as MegaSync into a shared directory, so players can download the saves if they want to continue with them.

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