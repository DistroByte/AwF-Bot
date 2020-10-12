//for a newline in the Discord message, have a \n at the end of a coreLineData
const { prefix } = require('./botconfig')
defaultColor = 'GREEN'
const factoriospcommands = {
  color: defaultColor,
  title: 'JammyBot Factorio SP Commands',
  author: {
    name: 'oof2win2',
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
};
const factoriompcommands = {
  color: defaultColor,
  title: 'JammyBot Factorio SP Commands',
  author: {
    name: 'oof2win2',
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
};
const ltn = {
  color: defaultColor,
  title: 'JammyBot LTN help',
  author: {
    name: 'oof2win2',
  },
  description: 'These are some of the most important items in the LTN mod. For a full guide/manual, see the [Mod Portal](https://forums.factorio.com/viewtopic.php?f=214&t=51072)',
  fields: [
    {
      name: 'Basic Mod Description',
      value: 'The LTN mod allows you to use fewer trains to transport items and for your trains to be able to be dynamically allocated - instead of having 5 trains for peak demand, you just have a total of 120 trains and if peak demand is reached, those 5 (or more) trains are dispatched to get and transport whatever items needed. According to Optera (the mod author), it can "cut the amount of rolling stock required to run a megabase down to 30% or less"'
    },
    {
      name: 'Beware Ahead:',
      value: 'LTN seems as a complex mod at first, but it is quite easy after you understand what does what. Until you understand that, I reccomend to use the [Optera’s blueprints](https://forums.factorio.com/viewtopic.php?t=51073) with some customizations, as if you screw up unloading/requests, your whole base can lay to ashes. With that said, LTN is not that bad if you know what you are doing at least a little bit.'
    },
    {
      name: '\u200b', //blank/spacer field
      value: '\u200b',
    },
    {
      name: 'Basic LTN items',
      value: '\u200b',
    },
    {
      name: 'Logistic Train Stop',
      value: 'The Logistic Train Stop allows the LTN mod to schedule trains to go from a Depot to a Provider station to a Requester station',
    },
    {
      name: 'LTN Depot',
      value: 'The LTN Depot is a Logistic Train Stop that is set for trains to be allowed to stop there when they are idling for a default period of 5s',
    },
    {
      name: 'LTN Provider Station',
      value: 'The LTN Provider station is a Logistic Train Stop that is set for trains to be allowed to pick items up, such as iron ore, steel, sulfuric acid etc to be then transported into LTN Requester Stations',
    },
    {
      name: 'LTN Requester Station',
      value: 'The LTN Requester Station is a Logistic Train Stop that is set for trains to deliver items to, such as red circuits require plastic (among others), so you would have one (or more) LTN Requester Stations wired up to request plastic',
    },
    {
      name: '\u200b', //blank/spacer field
      value: '\u200b',
    },
    {
      name: 'This is the end for my short description',
      value: 'If you would want to get the full description with everything, go [here](https://forums.factorio.com/viewtopic.php?f=214&t=51072) - the full fledged mod description by the creator, Optera'
    }
  ],
};
const servers = {
  color: defaultColor,
  title: 'JammyBot Server Help',
  author: {
    name: 'oof2win2',
  },
  description: 'This is a short description of the servers All-Weekend-Factorio has to offer',
  fields: [
    {
      name: 'Core',
      value: 'Core is a sort of map that is reset once in a while when most users agree to, a pretty long period of time (between a few weeks to a few months). It has some QoL mods installed, but nothing too big. It is password protected.',
    },
    {
      name: 'Corona Daycare',
      value: 'Corona Daycare is the type of map that is reset once a week or every other week, with lots of new players, who sometimes join the AwF community. It is completely vanilla, no password',
    },
    {
      name: 'Krastorio 2',
      value: 'The Krastorio 2 map. This map includes some QoL mods and quite a bit of other, complex mods that go hand-in-hand with Krastorio 2. This map is complex, but not the most complex. It is much longer and complex than the default game'
    },
    {
      name: 'seablock',
      value: 'The seablock map is basically bobangels, but you make EVERYTHING from purely water (and the seabed). Therefore, everything is muuuuch more complex, runs last hundreds of hours'
    },
    {
      name: 'bobs-angels',
      value: 'A BobAngels playthrough. Includes mods from great authors, Bobingabout and Arch666Angel. They make the playthrough complex, but not as complex as seablock - here you have land, lots of it - but you also have biters'
    }
  ],
};

module.exports = {
  //dictionary of messages is exported, so they can be searched with a key instead of long ifs
  messages: {
    'fspc': factoriospcommands,
    'fmpc': factoriompcommands,
    'ltn': ltn,
    'servers': servers,
  }
};
