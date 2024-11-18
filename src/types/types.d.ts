import { GuildBasedChannel, CategoryChannel, Guild, GuildMember, Role, TextChannel, InteractionEditReplyOptions, MessagePayload, VoiceChannel, ChannelType, MappedGuildChannelTypes, Gui, GuildBasedChannelldChannel } from "discord.js";
import { GuildSetupDataKey } from "../utils/guild/setup.js";
import { LogType } from "../utils/logger/createLogger.ts";
import { Model, QueryWithHelpers, HydratedDocument } from 'mongoose';
import { Logger } from "winston";
import { PunishmentType } from "../utils/admin/punishment.ts";

export type GuildData = {
	_id: string;
	name: string;
	guildSetupData?: GuildSetupDataIds;
	configuredAt?: Number;
	savedAt: Number;
};

export type GuildSetupData = Record<GuildSetupDataKey, GuildBasedChannel | Role | null>;

export type GuildSetupDataIds = Record<GuildSetupDataKey, string>;

export type GuildUpdateData = Omit<Partial<GuildData>, "_id">;

export type Punishment = {
	_id: string;
	username: string;
	punishmentReason: string;
	punishedAt: number;
	punishedBy: string;
	punishedUntil?: number;
	unpunishedAt?: number;
	unpunishedBy?: string;
	userRoles?: string[];
	punishmentType: PunishmentType;
};

export type PunishmentLog = {
	userId: string;
	userName: string;
	reason: string;
	punishedAt: number;
	punishedBy: string;
	punishedUntil?: number | 'Permanent';
	punishmenttype: PunishmentType;
	punishmenRevokedAt?: number;
};

export type BanParams = {
	targetUser: GuildMember;
	banReason: string;
	bannedAt: Date;
	bannedBy: string;
	banTime: string | null;
};

export type Resource = Promise<{
	promise: Promise<GuildBasedChannel | Role>;
	guildSetupDataKey: GuildSetupDataKey;
}>;

export type GuildResource = {
	settledPromise: GuildBasedChannel | Role;
	guildSetupDataKey: GuildSetupDataKey;
};

export type FulfilledGuildResources = {
	guildSetupData: GuildSetupData;
	areResultsComplete: Boolean;
};

export type GuildResourceResult = PromiseSettledResult<GuildResource>;

export type AddTimeFunc = (date: Date, time: number) => Promise<void>;

export type GetAddTimeFunc = Record<string, AddTimeFunc>;

export type LoggerLevels = {
	readonly crit: (error: string) => Promise<void>;
	readonly error: (error: string) => Promise<void>;
	readonly warning: (error: string) => Promise<void>;
	readonly notice: (error: string) => Promise<void>;
	readonly info: (error: string) => Promise<void>;
	readonly debug: (error: string) => Promise<void>;
};

export type LogHandlerOptions = {
	editReply?: EditReply;
	message?: string;
};

export type EditReply = (options: string | MessagePayload | InteractionEditReplyOptions) => Promise<Message<boolean>>;

export type MinecraftAPIResponse = {
	online: boolean;
	ip: string;
	port: number;
	hostname?: string;
	version: string;
	icon: string;
	players: {
		online: number;
		max: number;
	};
};

export interface Task {
	default(): Promise<void>;
}
