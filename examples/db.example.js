// Linked user in otherData/linkedPlayers
a = {
    factorioName: "oof2win2dev",        // name in Factorio
    discordID: "776900390687735818",    // user's Discord ID
}

// roles of a factorio player in otherData/playerRoles
a = {
    factorioName: "oof2win2dev",        // roles in Factorio
    roles: [
        "Member",
        "Veteran",
        "Trainee",
        "Jailed"
    ]
}

// global player statistics in otherData/globalPlayerStats
a = {
    discordID: "776900390687735818",    // user's Discord ID
    factorioName: "oof2win2dev",        // user's name in Factorio
    timePlayed: 0,      // this is deprecated and is 0 for all players
    time: 2543.14567,   // the amount of time a player played
    built: 10805,       // amount of entities a player built
    deaths: 9,          // amount of deaths a player has
    points: 2015.653,   // total number of points a player has
}

// deaths object of a player in <serverName>/deaths
a = {
    player: "oof2win2dev",
    deaths: {
        "behemoth-worm-turret": 3,
        "no-cause": 7,
        "BulletToothJake": 3
    }
}
// research of a server in <serverName>/stats
a = {
    research: "researchData", // this is a constant name, doesn't change
    research: {
        "automation": 2, // name and level of research
        "gate": 1
    }
}

// number of rocket launches a server has in <serverName>/stats
a = {
    rocketLaunches: 292
}