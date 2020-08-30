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
local function log1(event) --player death
	print ("JLOGGER: DIED: " .. game.get_player(event.player_index).name .. event.cause.name or "no cause") --jammylogger
end
local function log2()  --rocket launched
	print ("JLOGGER: ROCKET: " .. "ROCKET LAUNCHED") --jammylogger
end
local function log3(event)  --handcraft
	print ("JLOGGER: HANDCRAFT: " .. event.item_stack.name or "unnamed_item" .. game.get_player(event.player_index)) --jammylogger
end
local function log4(event)  --capsule
	print ("JLOGGER: CAPSULE:" .. game.get_player(event.player_index).name or "no player" .. event.item.name) --jammylogger
end
local function log5(event)  --research finished
	print ("JLOGGER: RESEARCH FINISHED: " .. event.research.name) --jammylogger
end
local function log6(event)  --fired artillery
	print ("JLOGGER: ARTILLERY: " .. event.entity.name .. event.source.name or "no source") --jammylogger
end


-- Data collection
script.on_event(defines.events.on_player_died,              function(event) log1(event) end)
script.on_event(defines.events.on_rocket_launched,          function(event) log2() end)
script.on_event(defines.events.on_player_crafted_item,      function(event) log3(event) end)
script.on_event(defines.events.on_player_used_capsule,      function(event) log4(event) end)
script.on_event(defines.events.on_research_finished,        function(event) log5(event) end)
script.on_event(defines.events.on_trigger_fired_artillery,  function(event) log6(event) end)
