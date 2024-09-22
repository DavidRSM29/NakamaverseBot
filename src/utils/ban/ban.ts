import { CacheType, ChatInputCommandInteraction, GuildMember } from "discord.js"

export class Ban {

    public async ban(interaction: ChatInputCommandInteraction<CacheType>) {
        try { 
            const targetUser = await this.isBanValid(interaction)
            const banReason = interaction.options.getString('razón') ?? 'No se proporcionó ninguna razón.'
            await targetUser.ban({ reason: banReason })
            return await interaction.followUp({ content: 'El usuario se ha vetado exitosamente.' })
        } catch (error) {
            if (error instanceof Error) await interaction.followUp({ content: `${error.name}: ${error.message}` })
        }
    }

    protected async isBanValid(interaction: ChatInputCommandInteraction<CacheType>): Promise<GuildMember> {
        if (!interaction.member || !interaction.guild?.members.me) throw new Error('Ha ocurrido un error por favor inténtelo de nuevo.')
        const userUsingCommand = await interaction.guild.members.fetch({ user: interaction.member.user.id })
        const targetUser = await interaction.guild.members.fetch({ user: interaction.options.getUser('usuario', true) })

        if (!targetUser || !userUsingCommand) throw new Error('El usuario proporcionado no existe en este servidor.')
        if (interaction.user.id === targetUser.id) throw new Error('No se puede vetar a usted mismo.')
        if (targetUser.id === interaction.guild.ownerId) throw new Error('No se puede vetar al propietario del servidor.')

        const targetUserRolePosition = targetUser.roles.highest.position
        const requestUserRolePosition = userUsingCommand.roles.highest.position
        const botRolePosition = interaction.guild.members.me.roles.highest.position

        if (targetUserRolePosition >= requestUserRolePosition) throw new Error(`No puede vetar a **${targetUser.displayName}** porque tiene el mismo a rol a usted o uno superior.`)

        if (targetUserRolePosition >= botRolePosition) throw new Error(`No puedo vetar a **${targetUser.displayName}** porque tiene el mismo a rol a mi(${interaction.guild.members.me.id}) o uno superior.`)

        return targetUser
    }
}