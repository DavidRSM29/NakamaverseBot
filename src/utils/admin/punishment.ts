import type { GuildMember } from "discord.js";
import { Log, logHandler, LogType } from "../logger/logHandler.js";
import { PunishmentModel } from "../../schemas/punishment.js";
import { PunishmentDate } from "./punishmentDate.js";
import { getRoles, setRole } from "../guild/roles.js";
import { GuildModel } from "../../schemas/guild.js";
import { Punishment } from "../../types/types.js";

export enum PunishmentType {
    BAN = 'ban',
    KICK = 'kick',
    MUTE = 'mute'
}

const punish = {
    [PunishmentType.BAN]: ban,
    [PunishmentType.KICK]: kick,
    [PunishmentType.MUTE]: mute,
} as const;

/**
 * @param {GuildMember} execUser User that executes the command
 * @param {GuildMember} targetUser User that is trying to be banned
 * @param {GuildMember} botUser User instance of the Bot
 * @param {string} guildOwnerId Id of the guild owner
 * @throws Log instance with a custom message
 */
export async function validatePunishment(execUser: GuildMember, targetUser: GuildMember, botUser: GuildMember, guildOwnerId: string): Promise<void> {
    if (execUser.id === targetUser.id) throw new Log("No se puede vetar usted mismo.", LogType.NOTICE);
    if (targetUser.id === guildOwnerId) throw new Log("No se puede vetar al propietario del servidor.", LogType.NOTICE);

    const targetUserRolePosition = targetUser.roles.highest.position;
    const requestUserRolePosition = execUser.roles.highest.position;
    const botRolePosition = botUser.roles.highest.position;

    if (targetUserRolePosition >= requestUserRolePosition)
        throw new Log(`No puede vetar a **${targetUser.displayName}** porque tiene el mismo a rol a usted o uno superior.`, LogType.NOTICE);
    if (targetUserRolePosition >= botRolePosition)
        throw new Log(`No puedo vetar a **${targetUser.displayName}** porque tiene el mismo a rol a mi(${botUser.displayName}) o uno superior.`, LogType.NOTICE);
}

export async function punishment(targetUser: GuildMember, punishment: Punishment) {
    return punish[punishment.punishmentType](targetUser, punishment);
}

export async function ban(targetUser: GuildMember, { _id, username, punishmentReason, punishedAt, punishedBy, punishedUntil, userRoles, punishmentType }: Punishment) {
    if (punishedUntil) {
        //const bannedUntil = await new PunishmentDate(bannedAt).addTime(banTime);
        if (punishedAt >= punishedUntil) throw new Log("La fecha de actual es mayor o igual a la fecha del veto.", LogType.NOTICE);
        const tempBanRole = (await GuildModel.findById(targetUser.guild.id))?.guildSetupData?.timeOutRole;
        if (!tempBanRole) throw new Log('No hay un rol de veto temporal configurado, use el comando /setup para configurarlo.', LogType.NOTICE);
        //const userRoles = (await getRoles(targetUser)).map(role => role.id);
        await setRole([tempBanRole], targetUser);
        const savedPunishment = await savePunishment({ _id, username, punishmentReason, punishedAt, punishedBy, punishedUntil, userRoles, punishmentType });
        if (savedPunishment === null) throw new Log('No se pudo guardar veto en la base de datos.', LogType.WARNING);
        return `${targetUser.displayName} se ha vetado del servidor.`;
    }
    const bannedUser = await targetUser.ban({ reason: punishmentReason });
    await savePunishment({ _id, username, punishmentReason, punishedAt, punishedBy, punishedUntil, userRoles, punishmentType });
    return `${bannedUser.displayName} se ha vetado del servidor.`;
}

async function kick(targetUser: GuildMember, { _id, username, punishmentReason, punishedAt, punishedBy, punishedUntil, userRoles, punishmentType }: Punishment) {
    const kickedUser = await targetUser.kick(punishmentReason);
    return '';
}

async function mute(targetUser: GuildMember, { _id, username, punishmentReason, punishedAt, punishedBy, punishedUntil, userRoles, punishmentType }: Punishment) {
    return '';
}

async function savePunishment(punishment: Punishment) {
    return PunishmentModel.create(punishment).catch(e => logHandler(e));
}

export async function unban(targetUser: GuildMember) {
    const storedBan = await PunishmentModel.findById(targetUser.id);
    if (storedBan === null) throw new Log('No existe ningun usuario vetado con ese ID.', LogType.NOTICE);
    await targetUser.guild.members.unban(targetUser.id);
    await storedBan.deleteOne();
    return `${targetUser.displayName} ya no esta vetado del servidor.`;
}