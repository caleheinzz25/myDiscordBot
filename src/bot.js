import dotenv from 'dotenv';
dotenv.config();
import { Client, IntentsBitField, GatewayIntentBits } from 'discord.js';
// import { getModules } from './utils/logger.js';
import { eventHandler } from './handlers/eventHandler.js';
import { getObjectModules } from './utils/logger.js';
const { mongoose: { connect } } = await getObjectModules("src/db","mongoose",true)

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
    IntentsBitField.Flags.GuildPresences,   
    GatewayIntentBits.GuildVoiceStates
  ]
});


await connect();

eventHandler(client);


client.login(process.env.TOKEN);

