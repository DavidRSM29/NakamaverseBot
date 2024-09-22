import type { SlashCommandProps, CommandOptions } from 'commandkit';
import { SlashCommandBuilder } from 'discord.js';
import { TempBan } from '../../utils/ban/tempBan';

export const data = new SlashCommandBuilder()
    .setName('tempban')
    .setDescription('Vetar a un usuario temporalmente.')
    .addUserOption((option) => {
        return option
            .setName('usuario')
            .setDescription('Usuario al que desea vetar del servidor.')
            .setRequired(true)
    })
    .addStringOption((option) => {
        return option
            .setName('tiempo')
            .setDescription('Tiempo del veto, formato: 1s,1m,1h,1d,1w,1mo,1y')
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
    await new TempBan().tempban(interaction)
};