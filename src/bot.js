import dotenv from 'dotenv';
dotenv.config();

import { Client, IntentsBitField } from 'discord.js';
import { getModules, getObjectModules, getFilesRecursively } from './utils/logger.js';
const handlers = await getModules("src", "handlers");


const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ]
});

handlers[1](client);


client.login(process.env.TOKEN);

