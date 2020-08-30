-- This .txt file is only to get things on how we colled the data
-- Default Factorio control.lua
local handler = require("event_handler")
handler.add_lib(require("freeplay"))
handler.add_lib(require("silo-script"))

script.on_event(defines.events.on_entity_died, function(event)
  local recently_deceased_entity = event.entity
  local time_of_death = event.tick

  game.print("Let it be known that " .. recently_deceased_entity.name ..
               " died a tragic death on tick " .. time_of_death)
end)

-- Grafana logging
local function log1(msg)
	print ("JLOGGER: " .. msg) --jammylogger
end
local function log2(msg, msg2)
	print ("JLOGGER: " .. msg .. msg2) --jammylogger
end
local function log3(msg, msg2, msg3)
	print ("JLOGGER: " .. msg .. msg2 .. msg3) --jammylogger
end
local function log4(msg, msg2, msg3, msg4)
	print ("JLOGGER: " .. msg .. msg2 .. msg3 .. msg4) --jammylogger
end


-- Data collection
script.on_event(defines.events.on_player_died,            function(event, player_index, cause) log3(event, "died", cause) end)
script.on_event(defines.events.on_rocket_launched,        function(event) log2(event, "rocket launched") end)
script.on_event(defines.events.on_player_crafted_item,    function(event, item_stack, player_index) log4(event, item_stack, "handcrafted by", player_index) end)
script.on_event(defines.events.on_research_finished, function(event, research) log3(event, "research", research) end)
script.on_event(defines.events.on_player_used_capsule, function(event, player_index, item) log4(event, "capsule", player_index, item) end)
script.on_event(defines.events.on_trigger_fired_artillery, function(event, entity, source) log4(event, "artillery fired", entity, source) end)
