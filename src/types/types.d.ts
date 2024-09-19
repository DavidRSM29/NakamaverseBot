import { CategoryChannel, Guild, Role, TextChannel } from "discord.js";

export type GuildSetupData = {
    tempBanCategory?: CategoryChannel | undefined,
    tempBanRole?: Role | undefined,
    mutedRole?: Role | undefined,
    ticketCategory?: CategoryChannel | undefined,
    ticketSupportRole?: Role | undefined,
    tempBanChannel?: TextChannel | undefined,
    ticketChannel?: TextChannel | undefined
}

export type CreateResourcesProps = {
    guild: Guild,
    guildSetupData: GuildSetupData
}

export type SaveGuildDataOnDB = {
    guildId: string,
    guildName: string,
    guildSetupData: GuildSetupData
}