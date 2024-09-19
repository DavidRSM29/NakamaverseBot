import { Schema, model } from "mongoose";

const tempBanSchema = new Schema(
    {
        _id: { type: String, required: true },
    }
)

export default model('TempBan', tempBanSchema)