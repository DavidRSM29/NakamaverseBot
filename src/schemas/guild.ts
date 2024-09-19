import { Schema, model } from "mongoose";

const guildSchema = new Schema(
    {
        _id: { type: String, required: true },
        name: { type: String, required: true },
        tempBanCategoryId: { type: String, required: true },
        tempBanChannelId: { type: String, required: true },
        tempBanRoleId: { type: String, required: true },
        mutedRoleId: { type: String, required: true },
        ticketCategoryId: { type: String, required: true },
        ticketChannelId: { type: String, required: true },
        ticketSupportRoleId: { type: String, required: true },
        configured: { type: Boolean, default: false }
    }
)

export default model('Guild', guildSchema)