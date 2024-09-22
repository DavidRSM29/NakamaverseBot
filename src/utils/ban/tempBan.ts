import { CacheType, ChatInputCommandInteraction, time } from "discord.js";
import { BanDate } from "../banDate";
import { Ban } from "./ban";

export class TempBan extends Ban {

    public async tempban(interaction: ChatInputCommandInteraction<CacheType>) {
        try {
            const targetUser = await this.isBanValid(interaction)
            const timeStamp = await new BanDate(interaction.createdAt).addTime(interaction.options.getString('tiempo', true), interaction.createdAt);
            await interaction.editReply({ content: `Usuario temporalmente vetado exitosamente, El veto termina ${timeStamp}` })
        } catch (error) {
            if (error instanceof Error) await interaction.editReply({ content: `${error.name}: ${error.message}` })
        }
    }
}