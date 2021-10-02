import Comfy from "./Comfy"
import path from "path"
import { Message } from "discord.js";

interface CommandRunOpts {
  client: Comfy
  message: Message
  args: string[]
}

export type Command<T = void> = {
  name: string
  description?: string
  usage?: string
  examples: string[]
  dirname: string
  enabled: boolean
  guildOnly: boolean
  aliases: string[]
  botPermissions: string[]
  memberPermissions: string[]
  customPermissions: string[]
  nsfw: boolean
  ownerOnly: boolean
  args: boolean
  cooldown: number
  run: (opts: CommandRunOpts) => Promise<T>
}