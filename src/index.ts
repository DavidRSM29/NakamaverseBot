import 'dotenv/config';
import { Client, IntentsBitField } from 'discord.js';
import { CommandKit } from 'commandkit';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { initTasks } from './tasks/taskLoader.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ],
});

new CommandKit({
  client,
  eventsPath: join(__dirname, 'events'),
  commandsPath: join(__dirname, 'commands'),
  devGuildIds: ['1279142969382932533'],
  devUserIds: ['747025723625177118'],
  skipBuiltInValidations: true,
  bulkRegister: true,
});

await client.login(process.env.TOKEN);

await initTasks(__dirname);