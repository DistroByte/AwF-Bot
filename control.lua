local handler = require("event_handler")
handler.add_lib(require("freeplay"))
handler.add_lib(require("silo-script"))

-- Grafana logging
local function logDeath(event) --player death
	print ("JLOGGER: DIED: " .. game.get_player(event.player_index).name .. ' ' .. event.cause.name or "no_cause") --jammylogger
end
local function logRocket()  --rocket launched
	print ("JLOGGER: ROCKET: " .. "ROCKET_LAUNCHED") --jammylogger
end
local function logHandcraft(event)  --handcraft
	print ("JLOGGER: HANDCRAFT: " .. event.item_stack.name or "unnamed_item" .. ' ' .. game.get_player(event.player_index)) --jammylogger
end
local function logCapsule(event)  --capsule
	print ("JLOGGER: CAPSULE:" .. event.item.name .. game.get_player(event.player_index).name or "no_player") --jammylogger
end
local function logResearch(event)  --research finished
	print ("JLOGGER: RESEARCH FINISHED: " .. event.research.name .. ' ' event.research.) --jammylogger
end
local function logArtillery(event)  --fired artillery
	print ("JLOGGER: ARTILLERY: " .. event.entity.name .. ' ' .. event.source.name or "no_source") --jammylogger
end


-- Data collection
script.on_event(defines.events.on_player_died,              function(event) logDeath(event) end)
script.on_event(defines.events.on_rocket_launched,          function(event) logRocket() end)
script.on_event(defines.events.on_player_crafted_item,      function(event) logHandcraft(event) end)
script.on_event(defines.events.on_player_used_capsule,      function(event) logCapsule(event) end)
script.on_event(defines.events.on_research_finished,        function(event) logResearch(event) end)
script.on_event(defines.events.on_trigger_fired_artillery,  function(event) logArtillery(event) end)

-- Jammy feedback to ? commands on Discord
script.on_event(defines.events.on_player_banned, )
