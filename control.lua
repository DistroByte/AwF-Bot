-- This .txt file is only to get things on how we colled the data
-- Default Factorio control.lua
local handler = require("event_handler")
handler.add_lib(require("freeplay"))
handler.add_lib(require("silo-script"))

local function log(msg)
	print ("JLOGGER: " .. msg) --jammylogger
end

-- Data collection
script.on_event(defines.events.on_player_died,            function(event) log(event, "died", cause) end)
script.on_event(defines.events.on_rocket_launched,        function(event) log(event, "rocket launched") end)




-- Optional logging:
-- script.on_event(defines.events.on_robot_built_entity,     function(event) log(event, "robot built entity"))
