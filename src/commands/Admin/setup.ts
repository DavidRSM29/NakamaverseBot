import { SlashCommandBuilder } from 'discord.js';
import type { CommandOptions, SlashCommandProps } from 'commandkit';
import { createSetupChannels, createSetupRolesAndCategories, getEmptySetupData, updateGuildById, undoChanges, getResourceId, findGuildById, saveGuild } from '../../utils/guild/setup.js';
import { logHandler } from '../../utils/logger/logHandler.js';

export const data = new SlashCommandBuilder()
    .setName('setup')
    .setDescription('Configura los roles y canales necesarios para el funcionamiento del BOT');

export const options: CommandOptions = {
    devOnly: true,
    userPermissions: ['Administrator']
};

export const run = async ({ interaction, client, handler }: SlashCommandProps) => {
    try {
        await interaction.deferReply({ ephemeral: true });

        if (!interaction.guild) return;

        let guildSetupData = await getEmptySetupData();
        let rolesAndCategories = await createSetupRolesAndCategories(guildSetupData, interaction.guild);

        if (rolesAndCategories.areResultsComplete === false) return undoChanges(rolesAndCategories.guildSetupData, interaction.editReply);

        let channels = await createSetupChannels(rolesAndCategories.guildSetupData, interaction.guild);

        if (channels.areResultsComplete === false) return undoChanges(channels.guildSetupData, interaction.editReply);

        const savedGuild = await findGuildById(interaction.guild.id);
        const guildSetupDataIds = await getResourceId(channels.guildSetupData);

        if (savedGuild === null) await saveGuild(interaction.guild, guildSetupDataIds);
        else await updateGuildById(interaction.guild.id, { guildSetupData: guildSetupDataIds, configuredAt: new Date().getTime() });

        await interaction.editReply({ content: 'El servidor se ha configurado exitosamente.' });

    } catch (error) {
        logHandler(error, { editReply: interaction.editReply });
    }
};