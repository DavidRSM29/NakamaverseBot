import type { SlashCommandProps, CommandOptions } from 'commandkit';
import { SlashCommandBuilder } from 'discord.js';
import { isBanValid } from '../../utils/sharedFunctions';
import { Ban } from '../../utils/ban/ban';

export const data = new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Vetar a un usuario permanentemente.')
    .addUserOption((option) => {
        return option
            .setName('usuario')
            .setDescription('Usuario al que desea vetar del servidor.')
            .setRequired(true)
    })
    .addStringOption((option) => {
        return option
            .setName('razón')
            .setDescription('(Opcional) Razón de la expulsión')
            .setRequired(false)
    })

export const options: CommandOptions = {
    devOnly: true,
    userPermissions: ['Administrator']
}

export const run = async ({ interaction, client, handler }: SlashCommandProps) => {
    await interaction.deferReply({ ephemeral: true })
    await new Ban().ban(interaction)
};