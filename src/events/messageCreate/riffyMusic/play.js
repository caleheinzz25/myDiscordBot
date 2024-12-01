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

    if (command === "play") {
        // Check if the user is in a voice channel
        if (!eventArg.member.voice.channel) {
            return eventArg.channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor(Colors.Red)
                        .setDescription('⚠️ You need to be in a voice channel to play music!')
                        .setTimestamp()
                ],
            });
        }

        const query = args.join(" ");
        if (!query) {
            return eventArg.channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor(Colors.Yellow)
                        .setDescription('🎵 Please provide a song name or URL to play!')
                        .setTimestamp()
                ],
            });
        }

        // Fetch the MusicChannel record from the database
        const musicChannel = await db.mongoose.MusicChannel.findOne({ guild_id: eventArg.guild.id });

        if (!musicChannel || musicChannel.channel_id !== eventArg.channel.id) {
            return eventArg.channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor(Colors.Red)
                        .setDescription(`🚫 This channel is not authorized for music playback.`)
                        .setTimestamp()
                ],
            });
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
            const resolve = await client.riffy.resolve({ query: query, requester: eventArg.author });
            const { loadType, tracks, playlistInfo } = resolve;

            let appliedFilters = [];
            if (musicChannel.filters.length){
                // Apply filters from the database
                appliedFilters = musicChannel.filters || [];

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

                // Apply each filter if it exists in the filters array
                appliedFilters.forEach((filter) => {
                    if (filterActions[filter]) {
                        player.filters[filterActions[filter]](true); // Enable the filter
                    }
                });

            }
            

            // Prepare the response
            const embed = new EmbedBuilder()
                .setColor(Colors.Blue)
                .setTitle("Active Filters")
                .setDescription(
                    appliedFilters.length > 0
                        ? appliedFilters.map((filter) => `✅ **${filter}**`).join("\n")
                        : "No active filters."
                )
                .setFooter({ text: `Requested by ${eventArg.author.tag}` })
                .setTimestamp();

            if (loadType === 'playlist') {
                for (const track of tracks) {
                    track.info.requester = eventArg.author;
                    player.queue.add(track);
                }

                eventArg.channel.send({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(Colors.Green)
                            .setTitle('📚 Playlist Added')
                            .setDescription(`Added \`${tracks.length} tracks\` from **${playlistInfo.name}** to the queue.`)
                            .setTimestamp(),
                        embed
                    ],
                });

                if (!player.playing && !player.paused) player.play();
            } else if (loadType === 'search' || loadType === 'track') {
                const track = tracks.shift();
                track.info.requester = eventArg.author;
                player.queue.add(track);

                eventArg.channel.send({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(Colors.Blue)
                            .setTitle('🎶 Track Added')
                            .setDescription(`Added **[${track.info.title}](${track.info.uri})** to the queue.`)
                            .setThumbnail(track.info.thumbnail || null)
                            .setTimestamp(),
                        embed
                    ],
                });

                if (!player.playing && !player.paused) player.play();
            } else {
                return eventArg.channel.send({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(Colors.Red)
                            .setDescription('❌ No results found for your query.')
                            .setTimestamp()
                    ],
                });
            }
        } catch (error) {
            console.error('Error resolving query:', error);
            return eventArg.channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor(Colors.Red)
                        .setDescription('❌ An error occurred while trying to fetch the track. Please try again later.')
                        .setTimestamp()
                ],
            });
        }
    }
};
