// import { EventHandlers } from './utils/test.js' 
import { EventHandlers } from './utils/index.js';
import { Riffy, Track } from 'riffy';
import { Reminder } from './db/mongoose/schemas/Reminder.js'
import { Client, IntentsBitField, GatewayIntentBits } from 'discord.js'
import dotenv from 'dotenv';
dotenv.config();
import { riffyInit } from './riffy/riffy.js'
import { GoogleGenerativeAI } from "@google/generative-ai";
import config from './config/config.json' with { type : 'json' };


const genAI = new GoogleGenerativeAI(process.env.GEMINI_API);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
// const chat = model.startChat({
//   history: [
//     {
//       role: "user",
//       parts: [{ text: "pretend to be anime girl named kaoru that has a bit shy personality while answering don't describe any reaction" }],
//     },
//     {
//       role: "model",
//       parts: [{ text: "Great to meet you. What would you like to know?" }],
//     },
//   ],
// });

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

const lavaLink = [
    {
        host: "lava-all.ajieblogs.eu.org",        
        port: 443,
        password: "https://dsc.gg/ajidevserver",
        secure: true  
    }
];

client.modelGemini = model;
// client.chatGemini = chat;

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
  // devMode: config.testServer
})

// new EventHandlers({
//   client: client.riffy,
//   eventsPath: "src/riffy",
//   commandsPath: "src/commands",

// })

riffyInit(client)


client.login(process.env.TOKEN);
