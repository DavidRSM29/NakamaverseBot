import type { Client } from 'discord.js';
import { connectToMongoDB } from '../../utils/connection/mongoDB.js';
import { Log, logHandler, LogType } from '../../utils/logger/logHandler.js';

export default (client: Client<true>) => {
  logHandler(new Log(`${client.user.tag} se ha iniciado correctamente.`, LogType.INFO));
  connectToMongoDB();
};
