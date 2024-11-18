import { Schema, model } from "mongoose";
import type { GuildData } from "../types/types.d.ts";

const guildSchema = new Schema<GuildData>({
	_id: { type: String, required: true },
	name: { type: String, required: true },
	guildSetupData: {
		timeOutCategory: { type: String, required: true },
		timeOutRole: { type: String, required: true },
		mutedRole: { type: String, required: true },
		ticketCategory: { type: String, required: true },
		ticketSupportRole: { type: String, required: true },
		timeOutChannel: { type: String, required: true },
		ticketChannel: { type: String, required: true },
	},
	configuredAt: { type: Number, required: true },
	savedAt: { type: Number, required: true }
});

export const GuildModel = model<GuildData>("Guild", guildSchema);
