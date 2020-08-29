//for a newline in the Discord message, have a \n at the end of a coreLineData

const messageHelp = {
  color: '#0099ff',
  title: 'Help Commands',
  author: {
    name: 'JammyBot',
  },
  description: 'These are all of the help commands programmed into JammyBot',
  fields: [
    {
      name: '+fcommandall',
      value: 'Send a command to all Factorio servers. Do not use / in the command, just type +fcommand ban Windsinger and it will automatically change it to /ban Windsinger when sending the command. Admin only.',
    },
    {
      name: '+fcommand',
      value: 'Send a command to the current Factorio server. Do not use / in the command, just type +fcommand ban Windsinger and it will automatically change it to /ban Windsinger when sending the command. Admin only.',
    },
    {
      name: '+sendall',
      value: 'Send a message to all Factorio servers, prefixed with the username of the user on Discord. Admin only.',
    },
    {
      name: '+factoriospcommands',
      value: 'Display all Factorio singleplayer commands',
    },
    {
      name: '+factoriompcommands',
      value: 'Display all Factorio multiplayer commands'
    },
  ],
  timestamp: new Date(),
  footer: {
    text: 'Made with :heart: and a little bit of code by oof2win2'
  },
};

const factoriospcommands = {
  color: '#0099ff',
  title: 'Factorio SP Commands',
  author: {
    name: 'JammyBot',
  },
  description: 'These are all of the Factorio in-game console commands for singleplayer/client that can be used in +fcommand and +fcommandall. Some of them that can be used only on the Factorio client have a @ in front of the slash. Admin-only commands also have a # in front. Cheat commands have not been included',
  fields: [
    {
      name: '/alerts <enable/disable/mute/unmute> <alert>',
      value: 'Enables, disables, mutes, or unmutes the given alert type. Available alerts: entity_destroyed, entity_under_attack, not_enough_construction_robots, no_material_for_construction, not_enough_repair packs, turret_fire, custom, no_storage, train_out_of_fuel, fluid_mixing',
    },
    {
      name: '/clear',
      value: 'Clears the console (only viewing, server-side stays)',
    },
    {
      name: '/evolution',
      value: 'Prints info about the alien evolution factor',
    },
    {
      name: '/mute-programmable-speaker <mute/unmute> <local/everyone>',
      value: 'Mutes or unmutes the global sounds created by the Programmable Speaker. Use “local” to mute just the local client. Admins can use “everyone” to mute the sounds for everyone on the server',
    },
    {
      name: '/perf-avg-frames <number>',
      value: 'Number of ticks/updates used to average performance counters. Default is 100. Value of 5-10 is recommended for fast convergence, but numbers will jitter more rapidly',
    },
    {
      name: '#@/permissions',
      value: 'Opens the permissions GUI'
    },
    {
      name: '/screenshot [x resolution] [y resolution] [zoom]',
      value: 'Takes a screenshot with the GUI hidden, centered on the player. It is saved in the \'script- output\' subfolder of your User data directory. Resolution is optional and defaults to the current window size. Zoom is optional and defaults to 1',
    },
    {
      name: '/time',
      value: 'Prints info about how old the map is',
    },
    {
      name: '#/toggle-action-logging',
      value: 'Toggles logging all input actions performed by the game. This value isn’t persisted between game restarts and only affects your local game in multiplayer sessions',
    },
    {
      name: '#/toggle-heavy-mode',
      value: 'Used to investigate desyncs. Will slow down the game and make multiplayer unplayable',
    },
    {
      name: '@/toggle-rockets-sent-gui',
      value: 'Toggles if the rockets sent button is shown in the upper left corner of the screen',
    },
    {
      name: '@/unlock-shortcut-bar',
      value: 'Unlocks all shortcut bar items',
    },
    {
      name: '/version',
      value: 'Prints the current game version - This is shown on Discord in channel description',
    },
  ],
  timestamp: new Date(),
  footer: {
    text: 'Made with :heart: and a little bit of code by oof2win2'
  },
};

const factoriompcommands = {
  color: '#0099ff',
  title: 'Factorio SP Commands',
  author: {
    name: 'JammyBot',
  },
  description: 'These are all of the Factorio in-game console commands for multiplayer/client that can be used in +fcommand and +fcommandall. Some of them that can be used only on the Factorio client have a @ in front of the slash. Admin-only commands also have a # in front. Cheat commands have not been included',
  fields: [
    {
      name: '#@/admin',
      value: 'Opens the player management GUI',
    },
    {
      name: '/admins',
      value: 'Prints a list of game admins',
    },
    {
      name: '#/ban <player> <reason>',
      value: 'Bans the specified player - <reason> can be blank',
    },
    {
      name: '#/banlist <add/remove/get/clear> <player>',
      value: 'Adds or removes a player from the banlist. Same as /ban or /unban. /banlist get should show the people banned, not admin-only',
    },
    {
      name: '#/config <get/set> <option> <value>',
      value: 'Gets or sets various multiplayer game settings. Available configs are: afk-auto-kick, allow-commands, allow-debug-settings, autosave-interval, autosave-only-on-server, ignore-player-limit-for-returning-players, max-players, max-upload-speed, only-admins-can-pause, password, require-user-verification, visibility-lan, visibility-public. Please don’t fiddle with this if you don’t know what you’re doing',
    },
    {
      name: '#/delete-blueprint-library <player>',
      value: 'Deletes the blueprint library storage for the given offline player from the save file. Enter “everybody confirm” to delete the storage of all offline players',
    },
    {
      name: '#/demote <player>',
      value: 'Demotes the player from admin',
    },
    {
      name: '@/ignore <player>',
      value: 'Prevents the chat from showing messages from this player. Admin messages are still shown',
    },
    {
      name: '@/ignores',
      value: 'Prints a list of ignored players',
    },
    {
      name: '#/kick <player> <reason>',
      value: 'Kicks the specified player, reason can be empty',
    },
    {
      name: '#/mute <player>',
      value: 'Prevents the player from saying anything in chat',
    },
    {
      name: '/mutes',
      value: 'Prints all players that are muted (can’t talk in chat)',
    },
    {
      name: '#@/open <player>',
      value: 'Opens another player’s inventory',
    },
    {
      name: '/players [online/o/count/c]',
      value: 'Prints a list of players in the game. (parameter online/o, it prints only players that are online, count/c prints only count)',
    },
    {
      name: '#/promote <player>',
      value: 'Promotes the player to admin',
    },
    {
      name: '#/purge <player>',
      value: 'Clears all the messages from this player from the chat log',
    },
    {
      name: '@/reply',
      value: 'Replies to the last player that whispered to you',
    },
    {
      name: '#/server-save',
      value: 'Saves the game on the server in a multiplayer game',
    },
    {
      name: '@/shout <message>',
      value: 'Sends a message to all players including other forces',
    },
    {
      name: '#@/swap-players <player> [player]',
      value: 'Swaps your character with the given player’s character, or if two players are given swaps the two player characters',
    },
    {
      name: '/unban <player>',
      value: 'Unbans the specified player',
    },
    {
      name: '@/unignore <player>',
      value: 'Allows the chat to show messages from this player',
    },
    {
      name: '@/whisper <player> <message>',
      value: 'Sends a message to the specified player',
    },
    {
      name: '/whitelist <add/remove/get/clear> [player]',
      value: 'Adds or removes a player from the whitelist, where only whitelisted players can join the game. Enter nothing for “player” when using “get” to print a list of all whitelisted players. An empty whitelist disables the whitelist functionality allowing anyone to join',
    },
  ],
  timestamp: new Date(),
  footer: {
    text: 'Made with :heart: and a little bit of code by oof2win2'
  },
};
