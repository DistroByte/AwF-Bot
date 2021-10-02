import Comfy from "./Comfy";
import path from "path";
import { Message, PermissionResolvable } from "discord.js";

interface CommandRunOpts {
  client: Comfy;
  message: Message;
  args: string[];
}

export type Command<T = void> = {
  name: string;
  description?: string;
  category: string;
  usage?: string;
  examples?: string[];
  dirname: string;
  enabled: boolean;
  guildOnly?: boolean;
  aliases?: string[];
  botPermissions?: PermissionResolvable[];
  memberPermissions?: PermissionResolvable[];
  customPermissions?: string[];
  nsfw?: boolean;
  ownerOnly?: boolean;
  run: (opts: CommandRunOpts) => Promise<T>;
};
