import { Guild, GuildChannelCreateOptions, GuildChannelEditOptions, GuildChannelTypes, ThreadEditOptions } from "discord.js";
import { GuildSetupDataKey } from "./setup.js";
import type { Resource } from "../../types/types.d.ts";

export async function createChannel<T>(guild: Guild, channelOptions: GuildChannelCreateOptions & { type: T; }, guildSetupDataKey: GuildSetupDataKey): Resource {
	return { promise: guild.channels.create(channelOptions), guildSetupDataKey };
}

export async function modifyChannel(guild: Guild, channelId: string, channelEditOptions: GuildChannelEditOptions & ThreadEditOptions) {
	const channel = await guild.channels.fetch(channelId);
	if (!channel) throw new Error("Channel not found.");
	return channel.edit(channelEditOptions);
}

export async function deleteChannel(guild: Guild, channelId: string) {
	return guild.channels.delete(channelId);
}
