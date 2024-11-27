// import { EventHandlers } from './utils/test.js' 
import { EventHandlers } from './utils/index.js';
import { Riffy, Track } from 'riffy';
import { Client, IntentsBitField, GatewayIntentBits, GatewayDispatchEvents, EmbedBuilder } from 'discord.js'
import dotenv from 'dotenv';
dotenv.config();
import config from './config/config.json' with { type : 'json' };

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
  // db: {
  //     dbPath: "src/db",
  //     database: [
  //         "mongoose"
  //     ]
  // },
  // devMode: {
  //   ...config
  // }
})

// This will send log when the lavalink node is connected.
client.riffy.on("nodeConnect", (node) => {
  console.log(`Node "${node.name}" connected.`);
});

// This will send log when the lavalink node faced an error.
client.riffy.on("nodeError", (node, error) => {
  console.log(`Node "${node.name}" encountered an error: ${error.message}.`);
});

/**
 * Event handler for when a track starts playing.
 * 
 * @event trackStart
 * @param {Player} player - The music player instance associated with the event.
 * @param {Track} track - The track that is currently playing.
 */
client.riffy.on("trackStart", async (player, track) => {
  const channel = client.channels.cache.get(player.textChannel);

  if (!channel) return;
  console.log(player, track)
  // Ambil informasi pengguna dari cache client
  const requester = client.users.cache.get(track.requesterId) || { username: 'Unknown', displayAvatarURL: () => null };

  // Membuat embed
  const embed = new EmbedBuilder()
      .setColor('#1DB954')
      .setTitle('🎶 Now Playing')
      .setDescription(`[${track.info.title}](${track.info.uri})`)
      .addFields(
          { name: 'Author', value: track.info.author, inline: true },
          { name: 'Duration', value: formatDuration(track.info.length), inline: true }
      )
      .setThumbnail(track.info.thumbnail || 'https://example.com/default-thumbnail.png')
      .setFooter({
          text: `Requested by ${requester.username}`,
          iconURL: requester.displayAvatarURL(),
      });

  // Mengirim embed ke channel
  channel.send({ embeds: [embed] });
});


/**
* Formats a duration in milliseconds to a `MM:SS` format.
* 
* @param {number} ms - The duration in milliseconds.
* @returns {string} - The formatted duration as `MM:SS`.
*/
function formatDuration(ms) {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
}


// This is the event handler for queue end.
client.riffy.on("queueEnd", async (player) => {
  const channel = client.channels.cache.get(player.textChannel);

  // Set this to true if you want to enable autoplay.
  const autoplay = true;

  if (autoplay) {
      player.autoplay(player);
  } else {
      player.destroy();
      channel.send("Queue has ended.");
  }
});

// This will update the voice state of the player.
client.on("raw", (d) => {
  if (
      ![
          GatewayDispatchEvents.VoiceStateUpdate,
          GatewayDispatchEvents.VoiceServerUpdate,
      ].includes(d.t)
  )
      return;
  client.riffy.updateVoiceState(d);
});

client.login(process.env.TOKEN);
