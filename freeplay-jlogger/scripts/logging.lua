local function on_rocket_launched(event)
	print ("JLOGGER: ROCKET: " .. "ROCKET LAUNCHED")
end

local function on_pre_player_died(event)
	print (event.cause.type)
	if event.cause and event.cause.type == "character" then
		print("JLOGGER: DIED: PLAYER: " .. game.get_player(event.player_index).name .. " " .. game.get_player(event.cause.player.index).name or "no-cause")
	elseif (event.cause) then
		print ("JLOGGER: DIED: " .. game.get_player(event.player_index).name .. " " .. event.cause.name or "no-cause")
	else
		print ("JLOGGER: DIED: " .. game.get_player(event.player_index).name .. " " .. "no-cause") --e.g. poison damage
	end
end

local function get_infinite_research_name(name) --gets the name of infinite research (without numbers)
  return string.match(name, "^(.-)%-%d+$") or name
end

local function on_research_finished(event)
	local research_name = get_infinite_research_name(event.research.name)
	print ("JLOGGER: RESEARCH FINISHED: " .. research_name .. " " .. event.research.level or "no-level")
end

local function on_trigger_fired_artillery(event)
	print ("JLOGGER: ARTILLERY: " .. event.entity.name .. event.source.name or "no source")
end



local lib = {}

lib.events =
{
	[defines.events.on_rocket_launched] = on_rocket_launched,
	[defines.events.on_pre_player_died] = on_pre_player_died,
	[defines.events.on_research_finished] = on_research_finished,
	[defines.events.on_trigger_fired_artillery] = on_trigger_fired_artillery
}

lib.on_event = function(event)
  local action = events[event.name]
  if not action then return end
  return action(event)
end

return lib
