import { EmbedBuilder, Colors } from 'discord.js';

/**
 * Handles the "play" command to play music in a voice channel with improved visual feedback and filter integration.
 * 
 * @param {Object} param0 - The parameters object.
 * @param {Object} param0.client - The Discord client instance.
 * @param {Object} param0.eventArg - The event argument containing message details.
 * @param {Object} param0.db - The database object for Mongoose models.
 */
export default async ({ client, eventArg, db }) => {
    if (!eventArg.content.startsWith('!') || eventArg.author.bot) return;

    const args = eventArg.content.slice(1).trim().split(" ");
    const command = args.shift().toLowerCase();

    if (command !== "play") return;

    // Check if the user is in a voice channel
    if (!eventArg.member.voice.channel) {
        return sendEmbed(eventArg.channel, Colors.Red, '⚠️ You need to be in a voice channel to play music!');
    }

    const query = args.join(" ");
    if (!query) {
        return sendEmbed(eventArg.channel, Colors.Yellow, '🎵 Please provide a song name or URL to play!');
    }

    // Fetch the MusicChannel record from the database
    const musicChannel = await db.mongoose.MusicChannel.findOne({ guild_id: eventArg.guild.id });

    if (!musicChannel || musicChannel.channel_id !== eventArg.channel.id) {
        return sendEmbed(eventArg.channel, Colors.Red, '🚫 This channel is not authorized for music playback.');
    }

    const player = client.riffy.createConnection({
        guildId: eventArg.guild.id,
        voiceChannel: eventArg.member.voice.channel.id,
        textChannel: eventArg.channel.id,
        deaf: true,
    });

    // Set the player's volume to the saved value or default to 100
    const volume = musicChannel.volume || 100;
    player.setVolume(volume);

    try {
        const resolve = await client.riffy.resolve({ query, requester: eventArg.author });
        const { loadType, tracks, playlistInfo } = resolve;

        // Apply filters if any
        applyFilters(player, musicChannel.filters);

        // Prepare the response
        const embed = new EmbedBuilder()
            .setColor(Colors.Blue)
            .setTitle("🎛️ Active Filters")
            .setDescription(musicChannel.filters.length > 0
                ? musicChannel.filters.map(filter => `✅ **${filter}**`).join("\n")
                : "No active filters.")
            .setFooter({ text: `Requested by ${eventArg.author.tag}` })
            .setTimestamp();

        if (loadType === 'playlist') {
            handlePlaylist(eventArg.channel, tracks, playlistInfo, embed, player);
        } else if (loadType === 'search' || loadType === 'track') {
            handleTrack(eventArg.channel, tracks.shift(), embed, player);
        } else {
            return sendEmbed(eventArg.channel, Colors.Red, '❌ No results found for your query.');
        }
    } catch (error) {
        console.error('Error resolving query:', error);
        return sendEmbed(eventArg.channel, Colors.Red, '❌ An error occurred while trying to fetch the track. Please try again later.');
    }
};

/**
 * Sends an embed message to the channel.
 *
 * @param {Object} channel - The message channel to send the embed to.
 * @param {string} color - The color for the embed.
 * @param {string} description - The description to include in the embed.
 */
function sendEmbed(channel, color, description) {
    return channel.send({
        embeds: [
            new EmbedBuilder()
                .setColor(color)
                .setDescription(description)
                .setTimestamp(),
        ],
    });
}

/**
 * Applies filters to the player.
 *
 * @param {Object} player - The music player instance.
 * @param {Array} filters - The list of filters to apply.
 */
function applyFilters(player, filters) {
    if (filters.length) {
        const filterActions = {
            "8d": "set8D",
            bassboost: "setBassboost",
            channelmix: "setChannelMix",
            distortion: "setDistortion",
            karaoke: "setKaraoke",
            lowpass: "setLowPass",
            nightcore: "setNightcore",
            rotate: "setRotation",
            slowmode: "setSlowmode",
            timescale: "setTimescale",
            tremolo: "setTremolo",
            vaporwave: "setVaporwave",
            vibrato: "setVibrato",
        };

        filters.forEach((filter) => {
            if (filterActions[filter]) {
                player.filters[filterActions[filter]](true); // Enable the filter
            }
        });
    }
}

/**
 * Handles adding a playlist to the queue and sending a response.
 *
 * @param {Object} channel - The message channel to send the response to.
 * @param {Array} tracks - The list of tracks in the playlist.
 * @param {Object} playlistInfo - Information about the playlist.
 * @param {Object} embed - The embed containing filter details.
 * @param {Object} player - The music player instance.
 */
function handlePlaylist(channel, tracks, playlistInfo, embed, player) {
    tracks.forEach((track) => track.info.requester = channel.author);
    player.queue.add(tracks);

    channel.send({
        embeds: [
            new EmbedBuilder()
                .setColor(Colors.Green)
                .setTitle('📚 Playlist Added')
                .setDescription(`Added \`${tracks.length} tracks\` from **${playlistInfo.name}** to the queue.`)
                .setTimestamp(),
            embed,
        ],
    });

    if (!player.playing && !player.paused) player.play();
}

/**
 * Handles adding a single track to the queue and sending a response.
 *
 * @param {Object} channel - The message channel to send the response to.
 * @param {Object} track - The track to add to the queue.
 * @param {Object} embed - The embed containing filter details.
 * @param {Object} player - The music player instance.
 */
function handleTrack(channel, track, embed, player) {
    track.info.requester = channel.author;
    player.queue.add(track);

    channel.send({
        embeds: [
            new EmbedBuilder()
                .setColor(Colors.Blue)
                .setTitle('🎶 Track Added')
                .setDescription(`Added **[${track.info.title}](${track.info.uri})** to the queue.`)
                .setThumbnail(track.info.thumbnail || null)
                .setTimestamp(),
            embed,
        ],
    });

    if (!player.playing && !player.paused) player.play();
}
