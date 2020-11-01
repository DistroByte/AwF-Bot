local handler = require("event_handler")
handler.add_lib(require("freeplay"))
handler.add_lib(require("silo-script"))
handler.add_lib(require("scripts/logging"))

--This is the scenario to start with if you wish to use JLogger features. Allows custom maps, no pre-generated map included
--If you already have a server, you can also copy the contents of this folder and paste them into a save you will load from