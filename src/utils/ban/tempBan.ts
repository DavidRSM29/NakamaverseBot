import { CacheType, ChatInputCommandInteraction } from "discord.js";
import { BanDate } from "../date";
import { Ban } from "./ban";

export class TempBan extends Ban {

    public async tempban(interaction: ChatInputCommandInteraction<CacheType>) {
        try {
            const targetUser = await this.isBanValid(interaction)
            const timeStamp = await new BanDate(interaction.createdAt).addTime(interaction.options.getString('tiempo', true), interaction.createdAt);
            return await interaction.editReply({ content: `Usuario temporalmente vetado exitosamente, El veto termina ${timeStamp}` })
        } catch (error) {
            if (error instanceof Error) return await interaction.editReply({ content: `${error.name}: ${error.message}` })
        }
    }
}