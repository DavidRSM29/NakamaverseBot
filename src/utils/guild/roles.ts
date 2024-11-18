import { Guild, GuildMember, Role, RoleCreateOptions, RoleResolvable } from "discord.js";
import { GuildSetupDataKey } from "./setup.js";
import type { Resource } from "../../types/types.d.ts";

export async function createRole(guild: Guild, role: RoleCreateOptions, guildSetupDataKey: GuildSetupDataKey): Resource {
    return { promise: guild.roles.create(role), guildSetupDataKey };
}

export async function getRoles(targetUser: GuildMember) {
    return targetUser.roles.cache.map(role => role);
}

export async function setRole(roles: RoleResolvable[], targetUser: GuildMember) {
    return targetUser.roles.set(roles);
}

export async function asignRole(roles: RoleResolvable[], targetUser: GuildMember) {
    return targetUser.roles.add(roles);
}

export async function removeRole(roles: RoleResolvable[], targetUser: GuildMember) {
    return targetUser.roles.remove(roles);
}

export async function clearRoles(targetUser: GuildMember) {
    return targetUser.roles.set([]);
}