prometheus = require("prometheus/prometheus")
require("utility")
local handler = require("event_handler")
local translate = require("scripts/translation")
local await_export = false

gauges = {}
histograms = {}

function doExport()
  game.write_file("graftorio/game.prom", prometheus.collect(), false)
end

handler.add_lib(require("scripts/statics"))
handler.add_lib(require("scripts/force_stats"))
handler.add_lib(require("scripts/trains"))
handler.add_lib(require("scripts/power"))
handler.add_lib(require("scripts/plugins"))
handler.add_lib(require("scripts/remote"))
handler.add_lib(translate)

--pause on graftorio work


-- JammyBot logging
local function logDeath(event) --player death
	print ("JLOGGER: DIED: " .. game.get_player(event.player_index).name .. ' ' .. event.cause.name or "no_cause") --jammylogger
end
local function logRocket()  --rocket launched
	print ("JLOGGER: ROCKET: " .. "ROCKET_LAUNCHED") --jammylogger
end
local function logResearch(event)  --research finished
	print ("JLOGGER: RESEARCH FINISHED: " .. event.research.name .. ' ' event.research.level) --jammylogger
end

local function bannedPlayer(event) --player has been banned
	print("JLOGGER: JFEEDBACK: BAN: " .. event.player_name .. ' ' .. event.reason or "no_reason")
end
local function unbannedPlayer(event) --player has been unbanned
	print("JLOGGER: JFEEDBACK: UNBAN: " .. event.player_name)
end
local function kickedPlayer(event) --player has been kicked
	print("JLOGGER: JFEEDBACK: KICK: " .. game.get_player(event.player_index).name .. ' ' .. event.reason or "no_reason")
end
local function mutedPlayer(event) --player has been muted
	print("JLOGGER: JFEEDBACK: MUTE: " .. game.get_player(event.player_index).name)
end
local function unmutedPlayer(event) --player has been unmuted
	print("JLOGGER: JFEEDBACK: UNMUTE: " .. game.get_player(event.player_index).name)
end

-- Jammy feedback to ? commands on Discord
script.on_event(defines.events.on_player_banned, 						function(event) bannedPlayer(event) end)
script.on_event(defines.events.on_player_unbanned, 					function(event) unbannedPlayer(event) end)
script.on_event(defines.events.on_player_kicked, 						function(event) kickedPlayer(event) end)
script.on_event(defines.events.on_player_muted, 						function(event) mutedPlayer(event) end)
script.on_event(defines.events.on_player_unmuted, 					function(event) unmutedPlayer(event) end)


-- Data collection for JammyLogger
script.on_event(defines.events.on_player_died,              function(event) logDeath(event) end)
script.on_event(defines.events.on_rocket_launched,          function(event) logRocket() end)
script.on_event(defines.events.on_research_finished,        function(event) logResearch(event) end)

--back to graftorio



-- Keep as last to export it all
handler.add_lib(
  {
    ["on_nth_tick"] = {
      [600] = function(event)
        if translate.in_progress() then
          await_export = true
        else
          doExport()
          await_export = false
        end
      end
    },
    events = {
      [defines.events.on_tick] = function(event)
        if event.tick % 30 == 0 and await_export and not translate.in_progress() then
          doExport()
          await_export = false
        end
      end
    }
  }
)
