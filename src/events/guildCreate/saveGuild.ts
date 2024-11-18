import { Guild } from "discord.js";
import { logHandler } from "../../utils/logger/logHandler.js";
import { saveGuild } from "../../utils/guild/setup.js";

export default async function saveNewGuild(guild: Guild) {
	try {
		await saveGuild(guild);
	} catch (error) {
		logHandler(error);
	}
}
