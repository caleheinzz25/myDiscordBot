
import { EventHandlers } from './utils/index.js';
import { Riffy } from 'riffy';
import { Client, IntentsBitField, GatewayIntentBits } from 'discord.js'
import dotenv from 'dotenv';
dotenv.config();
import { riffyInit } from './riffy/riffy.js'
import { GoogleGenerativeAI } from "@google/generative-ai";
import { lavaLink } from './utils/lavalink.js';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const client = new Client({
    intents: [
      IntentsBitField.Flags.Guilds,
      IntentsBitField.Flags.GuildMembers,
      IntentsBitField.Flags.GuildMessages,
      IntentsBitField.Flags.MessageContent,
      IntentsBitField.Flags.GuildPresences,  
      IntentsBitField.Flags.GuildMessageReactions,
      IntentsBitField.Flags.DirectMessages,
      IntentsBitField.Flags.GuildVoiceStates, 
      GatewayIntentBits.GuildVoiceStates
    ]
  });



client.modelGemini = model;

client.riffy = new Riffy(client, lavaLink, {
  send: (payload) => {
    const guild = client.guilds.cache.get(payload.d.guild_id);
    if (guild) guild.shard.send(payload);
  },
  defaultSearchPlatform: "ytmsearch",
  restVersion: "v4", // Or "v3" based on your Lavalink version.
})

new EventHandlers({
  client,
  commandsPath: "src/commands",
  eventsPath: "src/events",
  db: {
      dbPath: "src/db",
      database: [
          "mongoose"
      ]
  },
})

riffyInit(client)


client.login(process.env.TOKEN);
