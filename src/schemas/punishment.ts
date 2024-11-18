import { Error, Schema, model } from "mongoose";
import type { Punishment } from "../types/types.d.ts";
import { PunishmentType } from "../utils/admin/punishment.js";

const punishmentSchema = new Schema<Punishment>(
    {
        _id: { type: String, required: true },
        username: { type: String, required: true },
        punishmentReason: { type: String, required: true },
        punishedBy: { type: String, required: true },
        punishedAt: { type: Number, required: true },
        punishedUntil: { type: Number, required: false },
        unpunishedAt: { type: Number, required: false },
        unpunishedBy: { type: String, required: false },
        userRoles: { type: [String], required: false },
        punishmentType: { type: String, enum: PunishmentType, required: true }
    }
);

export const PunishmentModel = model<Punishment>('Punishment', punishmentSchema);