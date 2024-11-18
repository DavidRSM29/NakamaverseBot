import { ChannelType, Guild } from "discord.js";
import type { GuildSetupData, GuildData, EditReply, GuildSetupDataIds, GuildResourceResult, Resource, FulfilledGuildResources, GuildUpdateData } from "../../types/types.d.ts";
import { connectedToDB } from "../connection/mongoDB.js";
import { GuildModel } from '../../schemas/guild.js';
import { createChannel } from "./channels.js";
import { createRole } from "./roles.js";

export enum GuildSetupDataKey {
	TIMEOUTCATEGORY = 'timeOutCategory',
	TIMEOUTROLE = 'timeOutRole',
	TIMEOUTCHANNEL = 'timeOutChannel',
	TICKETCATEGORY = 'ticketCategory',
	TICKETSUPPORTROLE = 'ticketSupportRole',
	TICKETCHANNEL = 'ticketChannel',
	MUTEDROLE = 'mutedRole',
}

/**
 * @returns Returns a GuildSetupData object with all its values as null.
 */
export async function getEmptySetupData(): Promise<GuildSetupData> {
	return {
		ticketCategory: null,
		ticketChannel: null,
		ticketSupportRole: null,
		timeOutCategory: null,
		timeOutChannel: null,
		timeOutRole: null,
		mutedRole: null
	};
}

/**
 * @param {GuildSetupData} guildSetupData Object where all the resources are temporarily saved.
 * @param {Guild} guild Guild where the resources are going to be created.
 * @returns Returns an object with the created resources and a boolean to know if all were sucessful.
 */
export async function createSetupRolesAndCategories(guildSetupData: GuildSetupData, guild: Guild): Promise<FulfilledGuildResources> {
	const resources = [
		createChannel(guild, { name: 'Sala de Espera', type: ChannelType.GuildCategory }, GuildSetupDataKey.TIMEOUTCATEGORY),
		createRole(guild, { name: 'Vetado Temporalmente', mentionable: false, color: 'DarkButNotBlack' }, GuildSetupDataKey.TIMEOUTROLE),
		createRole(guild, { name: 'Silenciado', mentionable: false, color: 'NotQuiteBlack' }, GuildSetupDataKey.MUTEDROLE),
		createChannel(guild, { name: 'Soporte', type: ChannelType.GuildCategory }, GuildSetupDataKey.TICKETCATEGORY),
		createRole(guild, { name: 'Soporte', mentionable: true, color: 'Yellow' }, GuildSetupDataKey.TICKETSUPPORTROLE)
	];
	const guildResourcesResult = await createGuildResource(resources);
	return getFulfilledGuildResources(guildResourcesResult, guildSetupData);
}

/**
 * @param {GuildSetupData} guildSetupData Object where all the resources are temporarily saved.
 * @param {Guild} guild Guild where the resources are going to be created.
 * @returns Returns an object with the new resources and a boolean to know if all were created sucessfully.
 */
export async function createSetupChannels(guildSetupData: GuildSetupData, guild: Guild): Promise<FulfilledGuildResources> {
	if (!guildSetupData.timeOutCategory || !guildSetupData.timeOutRole || !guildSetupData.ticketCategory) throw 'Error al crear los recursos.';
	const resources: Resource[] = [
		createChannel(guild, {
			name: 'Vetados', type: ChannelType.GuildText, parent: guildSetupData.timeOutCategory.id, permissionOverwrites: [
				{ id: guild.id, deny: 'ViewChannel' },
				{ id: guildSetupData.timeOutRole.id, allow: 'ViewChannel' }
			]
		}, GuildSetupDataKey.TIMEOUTCHANNEL),
		createChannel(guild, { name: 'Tickets', type: ChannelType.GuildText, parent: guildSetupData.ticketCategory.id }, GuildSetupDataKey.TICKETCHANNEL)
	];
	const guilldResources = await createGuildResource(resources);
	return getFulfilledGuildResources(guilldResources, guildSetupData);
}

/**
 * @param {Guild} guild Guild object to get the guild id and the guild name
 */
export async function saveGuild(guild: Guild, guildSetupDataIds?: GuildSetupDataIds) {
	await connectedToDB();
	new GuildModel<GuildData>({
		_id: guild.id,
		name: guild.name,
		guildSetupData: guildSetupDataIds ? guildSetupDataIds : undefined,
		configuredAt: guildSetupDataIds ? new Date().getTime() : undefined,
		savedAt: new Date().getTime()
	}).save();
}

/**
 * @param {string} guildId Id to search the guild
 * @returns Return a guild if saved or null
 */
export async function findGuildById(guildId: string) {
	await connectedToDB();
	return GuildModel.findById(guildId);
}

/**
 * @param {string} guildId Id to search the guild 
 * @param guildData 
 */
export async function updateGuildById(guildId: string, guildUpdateData: GuildUpdateData) {
	await connectedToDB();
	return GuildModel.findByIdAndUpdate(guildId, guildUpdateData);
}

/**
 * @param {GuildSetupData} guildSetupData Object where all the resources are temporarily saved.
 * @param {EditReply} editReply Function from ChatInputCommandInteraction so the bot can reply on discord.
 */
export async function undoChanges(guildSetupData: GuildSetupData, editReply: EditReply) {
	const resources = Object.values(guildSetupData);
	await Promise.all(resources.map(async item => {
		if (item) item.delete();
	}));
	await editReply({ content: `**Algo salio mal, todos los cambios se han eliminado.**` });
}

/**
 * @param {Resource[]} resources Array of promises that resolve to an object that contain a promise for the new resource and a key from GuildSetupDataKey Enum.
 * @returns Return a GuildResourceResult Array that contain the fulfilled promise and the same key from GuildSetupDatakey.
 */
async function createGuildResource(resources: Resource[]): Promise<GuildResourceResult[]> {
	return Promise.all(resources)
		.then(createdResources => Promise.allSettled(createdResources
			.map(resource => resource.promise
				.then(settledPromise => ({ settledPromise, guildSetupDataKey: resource.guildSetupDataKey }))
			)
		));
}

/**
 * @param {GuildResourceResult[]} createdResources Array of PromiseSettledResult from where all of it's fulfilled values will be extracted.
 * @param {GuildSetupData} guildSetupData Object where all the resources are temporarily saved.
 * @returns Returns an Object where all the extracted values from createdResources as a guildSetupData Object and a boolean that will determine if all the resources where successfully created.
 */
async function getFulfilledGuildResources(createdResources: GuildResourceResult[], guildSetupData: GuildSetupData): Promise<FulfilledGuildResources> {
	let areResultsComplete: Boolean = true;
	for (let index = 0; index < createdResources.length; index++) {
		const resource = createdResources[index];
		if (resource?.status === 'fulfilled') guildSetupData[resource.value.guildSetupDataKey] = resource.value.settledPromise;
		if (resource?.status === 'rejected') areResultsComplete = false;
	}
	return { guildSetupData, areResultsComplete };
}

/**
 * @param {GuildSetupData} guildSetupData Object where all the resources are temporarily saved. 
 * @returns Returns all the ids of the resources in the guildSetupData object as a GuildSetupDataIds object
 */
export async function getResourceId(guildSetupData: GuildSetupData) {
	let resourceIds: Partial<Record<GuildSetupDataKey, string>> = {};
	for (const key in guildSetupData) {
		if (Object.prototype.hasOwnProperty.call(guildSetupData, key)) {
			const resource = guildSetupData[key as GuildSetupDataKey];
			if (!resource) continue;
			resourceIds[key as GuildSetupDataKey] = resource.id;
		}
	}
	return resourceIds as GuildSetupDataIds;
}