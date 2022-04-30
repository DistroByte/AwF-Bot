import { Presence } from "discord.js";
import Comfy from "../../base/Comfy";
import fifo from "../../helpers/fifo-handler";

export default async (client: Comfy, _, newPresence: Presence) => {
  if (newPresence.userId === client.config.testbotid)
    fifo.checkDevServer(newPresence);
};
