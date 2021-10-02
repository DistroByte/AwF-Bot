import { Message } from "discord.js";
import Comfy from "../../base/Comfy";

export default async (client: Comfy, oldMessage: Message, newMessage: Message) => {
  if (!newMessage.editedAt) return;
  client.emit("message", newMessage);
}