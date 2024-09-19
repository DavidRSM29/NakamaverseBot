import type { Client } from 'discord.js';
import {connectToMongoDB} from '../../utils/mongoDB'

export default (client: Client<true>) => {
  console.log(`${client.user.tag} is online!`);
  connectToMongoDB();
};
