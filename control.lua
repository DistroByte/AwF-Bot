-- This .txt file is only to get things on how we colled the data
-- Default Factorio control.lua
local handler = require("event_handler")
handler.add_lib(require("freeplay"))
handler.add_lib(require("silo-script"))

local function log(msg)
	print ("JLOGGER: " .. msg) --jammylogger
end

-- Data collection
script.on_event(defines.events.on_player_died,            function(event, player_index, cause) log(event, "died", cause) end)
script.on_event(defines.events.on_rocket_launched,        function(event) log(event, "rocket launched") end)
script.on_event(defines.events.on_player_crafted_item,    function(event, item_stack, player_index) log(event, item_stack, "handcrafted by", player_index) end)
script.on_event(defines.events.on_research_finished, function(event, research) log(event, "research", research) end)
script.on_event(defines.events.on_player_used_capsule, function(event, player_index, item) log(event, "capsule", player_index, item) end)
script.on_event(defines.events.on_trigger_fired_artillery, function(event, entity, source) log(event, "artillery fired", entity, source) end)




-- Optional logging:
-- script.on_event(defines.events.on_robot_built_entity,     function(event) log(event, "robot built entity"))
