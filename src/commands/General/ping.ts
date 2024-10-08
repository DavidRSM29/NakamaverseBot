import type {
  CommandData,
  SlashCommandProps,
  CommandOptions,
} from 'commandkit';

export const data: CommandData = {
  name: 'ping',
  description: 'Replies with Pong',
};

export const run = async ({ interaction }: SlashCommandProps) => {
  await interaction.deferReply({ ephemeral: true })
  interaction.editReply('Pong!');
};

export const options: CommandOptions = {
  // https://commandkit.js.org/typedef/CommandOptions
};
