/**
 * @file File for functions that didn't deserve their own helper file. Generally small functions
 */

import { Message, MessageEmbedOptions, TextChannel } from "discord.js";

import { MessageEmbed } from "discord.js";
import serversJS from "../servers";
import childprocess from "child_process";
import discord from "discord.js";
import fs from "fs";
import { BannedPlayers, ExtraBans, ExtraBansAttributes } from "./sqlitedb";
import { FactorioServer } from "../servers";

type ArgumentTypes<F extends Function> = F extends (...args: infer A) => any ? A : never;

/**
 * Sorts an array with BubbleSort. Tested with strings and numbers.
 * @param {Array} arr - Unsorted array
 * @returns {Array} Sorted array
 */
export function bubbleSort<T>(arr: T[]): T[]  {
  var len = arr.length;
  for (var i = 0; i < len; i++) {
    for (var j = 0; j < len - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        // swap
        var temp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = temp;
      }
    }
  }
  return arr;
}
/**
 *
 * @param {discord.Snowflake} channelID - ID of the Discord channel that you are trying to get
 * @returns {(object|null)} A server object from the servers.js file
 */
export function getServerFromChannelInput(channelID: string): FactorioServer|null {
  let serverKeys = Object.keys(serversJS);
  for (let i = 0; i < serverKeys.length; i++) {
    if (serversJS[serverKeys[i]].discordid == channelID) {
      return serversJS[serverKeys[i]];
    }
  }
  return null;
}
/**
 * Run a shell command. Returns only after the command is finished. DOesn't allow for extra specifications
 * @param {string} cmd - Shell command to run
 * @returns {(childprocess.stdout|childprocess.stderr)}
 */
export async function runShellCommand(cmd: string): Promise<string> {
  return new Promise((resolve, reject) => {
    childprocess.exec(cmd, function (error, stdout, stderr) {
      if (stdout) resolve(stdout);
      if (stderr) reject(stderr);
      if (error) reject(error);
    });
  });
}
/**
 * Sort a directory's contents by date modified
 * @param {} pathArr - Path to the directory you want to get files from and sort by modified date
 * @returns {} Array of path objects, sorted by last modified. has path and mtime (modified time)
 */
export function sortModifiedDate(pathArr: string[]) {
  let files = pathArr.map((path) => {
    return {
      path: path,
      mtime: fs.statSync(path).mtime.getTime(),
    };
  });
  return files.sort((a, b) => b.mtime - a.mtime);
}

export async function getConfirmationMessage(message: Message, content: ArgumentTypes<TextChannel["send"]>) {
  const confirm = await message.channel.send(content);
  confirm.react("✅");
  confirm.react("❌");
  const reactionFilter: discord.CollectorFilter = (reaction, user) => user.id === message.author.id;
  let reactions;
  try {
    reactions = await confirm.awaitReactions(reactionFilter, {
      max: 1,
      time: 120000,
      errors: ["time"],
    });
  } catch (error) {
    return false;
  }
  const reaction = reactions.first();
  if (reaction.emoji.name === "❌") return false;
  return true;
}

/**
 *
 * @param {Array} fields
 * @param {object} embedMsgOptions - Standard
 * @param {object} options
 * @param {options.maxPageCount} maxPageCount - maximum number of things on the page
 */
export async function createPagedEmbed(
  fields: MessageEmbed["fields"],
  message: Message,
  options: {maxPageCount: number} = {maxPageCount:25},
  embedMsgOptions?: MessageEmbed|MessageEmbedOptions,
): Promise<void> {
  let embed = new MessageEmbed(embedMsgOptions);
  let page = 0;
  const maxPages = Math.floor(fields.length / options.maxPageCount);
  embed.fields = fields.slice(0, options.maxPageCount);
  let embedMsg = await message.channel.send(embed);

  const setData = async () => {
    const start = page * options.maxPageCount;
    embed.fields = fields.slice(start, start + options.maxPageCount);
    embedMsg = await embedMsg.edit(null, embed);
  };
  const removeReaction = async (emoteName) => {
    embedMsg.reactions.cache
      .find((r) => r.emoji.name === emoteName)
      .users.remove(message.author.id);
  };

  embedMsg.react("⬅️");
  embedMsg.react("➡️");
  embedMsg.react("🗑️");

  const backwardsFilter = (reaction, user) =>
    reaction.emoji.name === "⬅️" && user.id === message.author.id;
  const forwardsFilter = (reaction, user) =>
    reaction.emoji.name === "➡️" && user.id === message.author.id;
  const removeFilter = (reaction, user) =>
    reaction.emoji.name === "🗑️" && user.id === message.author.id;

  const backwards = embedMsg.createReactionCollector(backwardsFilter, {
    time: 120000,
  });
  const forwards = embedMsg.createReactionCollector(forwardsFilter, {
    time: 120000,
  });
  const remove = embedMsg.createReactionCollector(removeFilter, {
    time: 120000,
  });

  backwards.on("collect", (reaction) => {
    page--;
    removeReaction("⬅️"); // remove the user's reaction no matter what
    if (page == -1) page = 0;
    else setData();
  });
  forwards.on("collect", (reaction) => {
    page++;
    removeReaction("➡️"); // remove the user's reaction no matter what
    if (page > maxPages) page = maxPages;
    else setData();
  });

  remove.on("collect", () => {
    embedMsg.delete();
  });
}

/**
 * Check whether or not a player is on the banlist
 * @param {String} playername
 */
export async function checkBan(playername: string): Promise<false|ExtraBansAttributes> {
  const extra = await ExtraBans.findOne({
    where: {
      playername: playername,
    },
  }).then(r=>r.get());
  if (extra) return extra;

  const banned = await BannedPlayers.findOne({
    where: {
      playername: playername,
    },
  }).then(r=>r.get());
  if (banned && banned.id) return banned;
  return false;
}

/**
 * Add a player to the banlist
 * @param {String} playername
 * @param {String} reason
 */
async function addban(playername, reason) {
  const player = await ExtraBans.create({
    playername: playername,
    reason: reason || "No reason given",
  });

  return player;
}

/**
 * Remove a player from the banlist
 * @param {String} playername
 */
async function removeban(playername) {
  const extrabans = await ExtraBans.findOne({
    where: {
      playername: playername,
    },
  });
  if (extrabans) extrabans.destroy();

  const banned = await BannedPlayers.findOne({
    where: {
      playername: playername,
    },
  });
  if (banned) banned.destroy();

  return true;
}
