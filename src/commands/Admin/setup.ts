import { CacheType, CategoryChannel, ChannelType, ChatInputCommandInteraction, Client, Role, SlashCommandBuilder, TextChannel } from 'discord.js';
import guildModel from '../../schemas/guild'
import { CommandOptions, SlashCommandProps } from 'commandkit';
import { isConnected } from '../../utils/mongoDB';
import { setTimeout } from 'timers/promises';
import { CreateResourcesProps, GuildSetupData, SaveGuildDataOnDB } from '../../types/types';

export const data = new SlashCommandBuilder()
    .setName('setup')
    .setDescription('Configura los roles y canales necesarios para el funcionamiento del BOT')

export const options: CommandOptions = {
    devOnly: true,
    userPermissions: ['Administrator']
}

export const run = async ({ interaction, client, handler }: SlashCommandProps) => {
    await interaction.deferReply({ ephemeral: true })
    await setup(interaction)
}

async function setup(interaction: ChatInputCommandInteraction) {
    const guildSetupData: GuildSetupData = {};
    const configured = await createAndConfigureResources(interaction, guildSetupData)
    if (configured === true) return await interaction.editReply({ content: 'La configuracion fue existosa.' })
}

async function createAndConfigureResources(interaction: ChatInputCommandInteraction, guildSetupData: GuildSetupData) {
    try {
        if (!await isConnected())
            throw new Error('La coneccion a la base de datos no esta activa.')
        if (!interaction.guild)
            throw new Error('Se produjo un error.')
        await createRolesAndCategories({ guild: interaction.guild, guildSetupData })
        await createChannels({ guild: interaction.guild, guildSetupData })
        await saveGuildDataOnDB({ guildId: interaction.guild.id, guildName: interaction.guild.name, guildSetupData })
        await guildModel.updateOne({ configured: true }, { _id: interaction.guild.id })
        return true
    } catch (error) {
        if (error instanceof Error) await undoChanges(guildSetupData, error.message, interaction)
        return false;
    }
}

async function undoChanges(guildSetupData: GuildSetupData, error: string, interaction: ChatInputCommandInteraction<CacheType>) {
    const resources = Object.values(guildSetupData)
    resources.map(async item => {
        await item.delete();
    })
    await interaction.editReply({ content: `**Se han eliminado los cambios hechos, Error**: ${error}` })
}

async function createRolesAndCategories({ guild, guildSetupData }: CreateResourcesProps) {
    const rolesAndCategories =
        await Promise.allSettled(
            [
                guild.channels.create({ name: 'Sala de Espera', type: ChannelType.GuildCategory }),
                guild.roles.create({ name: 'Vetado Temporalmente', mentionable: false, color: 'DarkButNotBlack' }),
                guild.roles.create({ name: 'Silenciado', mentionable: false, color: 'NotQuiteBlack' }),
                guild.channels.create({ name: 'Soporte', type: ChannelType.GuildCategory }),
                guild.roles.create({ name: 'Soporte', mentionable: true, color: 'Yellow' })
            ]
        )
    guildSetupData.tempBanCategory = rolesAndCategories[0].status === 'fulfilled' ? rolesAndCategories[0].value : undefined;
    guildSetupData.tempBanRole = rolesAndCategories[1].status === 'fulfilled' ? rolesAndCategories[1].value : undefined;
    guildSetupData.mutedRole = rolesAndCategories[2].status === 'fulfilled' ? rolesAndCategories[2].value : undefined;
    guildSetupData.ticketCategory = rolesAndCategories[3].status === 'fulfilled' ? rolesAndCategories[3].value : undefined;
    guildSetupData.ticketSupportRole = rolesAndCategories[4].status === 'fulfilled' ? rolesAndCategories[4].value : undefined;
}

async function createChannels({ guild, guildSetupData }: CreateResourcesProps) {
    if (!guildSetupData.tempBanCategory || !guildSetupData.tempBanRole) throw new Error('Error al crear los recursos.')
    const textChannels =
        await Promise.allSettled([
            guild.channels.create({
                name: 'Vetados', type: ChannelType.GuildText, parent: guildSetupData.tempBanCategory.id, permissionOverwrites: [
                    { id: guild.id, deny: 'ViewChannel' },
                    { id: guildSetupData.tempBanRole.id, allow: 'ViewChannel' }
                ]
            }),
            guild.channels.create({ name: 'Tickets', parent: guildSetupData.ticketCategory })
        ])
    guildSetupData.tempBanChannel = textChannels[0].status === 'fulfilled' ? textChannels[0].value : undefined
    guildSetupData.ticketChannel = textChannels[1].status === 'fulfilled' ? textChannels[1].value : undefined
}

async function saveGuildDataOnDB({ guildId, guildName, guildSetupData }: SaveGuildDataOnDB) {
    try {
        if (!guildSetupData.tempBanCategory || !guildSetupData.tempBanRole || !guildSetupData.ticketCategory || !guildSetupData.ticketSupportRole || !guildSetupData.tempBanChannel || !guildSetupData.mutedRole || !guildSetupData.ticketChannel)
            throw new Error('Error al crear los recursos necesarios para configurar el servidor.')
        return await new guildModel({
            _id: guildId,
            name: guildName,
            tempBanCategoryId: guildSetupData.tempBanCategory.id,
            tempBanChannelId: guildSetupData.tempBanChannel.id,
            tempBanRoleId: guildSetupData.tempBanRole.id,
            mutedRoleId: guildSetupData.mutedRole.id,
            ticketCategoryId: guildSetupData.ticketCategory.id,
            ticketChannelId: guildSetupData.ticketChannel.id,
            ticketSupportRoleId: guildSetupData.ticketSupportRole.id
        }).save()
    } catch (error) {
        if (error instanceof Error) return error
    }
}