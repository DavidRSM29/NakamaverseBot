import type { SlashCommandProps, CommandOptions } from 'commandkit';
import { SlashCommandBuilder, SlashCommandSubcommandBuilder } from 'discord.js';
import { ban, punishment, PunishmentType, validatePunishment } from '../../utils/admin/punishment.js';
import { PunishmentDate } from '../../utils/admin/punishmentDate.js';
import { getRoles } from '../../utils/guild/roles.js';
import { logHandler } from '../../utils/logger/logHandler.js';

export const data = new SlashCommandBuilder()
    .setName('punish')
    .setDescription('Comando para aplicar una sancion a un usuario.')
    .addSubcommand(subCommand => {
        return subCommand
            .setName('ban')
            .setDescription('asd')
            .addUserOption((option) => {
                return option
                    .setName('usuario')
                    .setDescription('Usuario al que desea vetar del servidor.')
                    .setRequired(true);
            })
            .addStringOption((option) => {
                return option
                    .setName('razón')
                    .setDescription('Razón de la expulsión')
                    .setRequired(false);
            })
            .addStringOption((option) => {
                return option
                    .setName('tiempo')
                    .setDescription('Si el veto es temporal especifique cuanto tiempo durara, formato -> 1s,1m,1h,1d,1w,1mo,1y')
                    .setRequired(false);
            });
    })
    .addSubcommand(subCommand => {
        return subCommand
            .setName('kick')
            .setDescription('asd')
            .addUserOption((option) => {
                return option
                    .setName('usuario')
                    .setDescription('Usuario al que desea vetar del servidor.')
                    .setRequired(true);
            })
            .addStringOption((option) => {
                return option
                    .setName('razón')
                    .setDescription('Razón de la expulsión')
                    .setRequired(false);
            });
    })
    .addSubcommand(subCommand => {
        return subCommand
            .setName('mute')
            .setDescription('asd')
            .addUserOption((option) => {
                return option
                    .setName('usuario')
                    .setDescription('Usuario al que desea vetar del servidor.')
                    .setRequired(true);
            })
            .addStringOption((option) => {
                return option
                    .setName('razón')
                    .setDescription('Razón de la expulsión')
                    .setRequired(false);
            });
    });

export const options: CommandOptions = {
    devOnly: true,
    userPermissions: ['Administrator']
};

export const run = async ({ interaction, client, handler }: SlashCommandProps) => {
    try {
        await interaction.deferReply({ ephemeral: true });

        if (!interaction.guild || !interaction.member || !interaction.guild.members.me) throw new Error('Ha ocurrido un error.');

        const [banReason, banTime] = [interaction.options.getString('razón') ?? 'Razón no especificada.', interaction.options.getString('tiempo')];
        const [execUser, targetUser] = await Promise.all([
            interaction.guild.members.fetch({ user: interaction.member.user.id }),
            interaction.guild.members.fetch({ user: interaction.options.getUser('usuario', true) })
        ]);

        await validatePunishment(execUser, targetUser, interaction.guild.members.me, interaction.guild.ownerId);

        const msg = await punishment(targetUser,
            {
                _id: targetUser.id,
                username: targetUser.displayName,
                punishmentReason: banReason,
                punishedAt: interaction.createdAt.getTime(),
                punishedBy: interaction.user.id,
                punishedUntil: banTime ? await new PunishmentDate(interaction.createdAt).addTime(banTime) : undefined,
                userRoles: banTime ? (await getRoles(targetUser)).map(role => role.id) : undefined,
                punishmentType: PunishmentType.BAN
            });
        await interaction.editReply({ content: msg });
    } catch (error) {
        logHandler(error, { editReply: interaction.editReply });
    }
};