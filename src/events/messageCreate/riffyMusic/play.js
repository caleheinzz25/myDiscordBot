import { EmbedBuilder, Colors } from 'discord.js';

export default async ({ client, eventArg, db }) => {
    if (!eventArg.content.startsWith('!') || eventArg.author.bot) return;

    const args = eventArg.content.slice(1).trim().split(" ");
    const command = args.shift().toLowerCase();

    if (command === "play") {
        if (!eventArg.member.voice.channel) {
            eventArg.channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor(Colors.Red)
                        .setDescription('You need to be in a voice channel to play music!')
                ],
            });
            return;
        }

        // Fetch the MusicChannel record from the database
        const musicChannel = await db.mongoose.MusicChannel.findOne({ guild_id: eventArg.guild.id });

        // Check if the bot has permission to send messages in the channel
        if (!musicChannel || musicChannel.channel_id !== eventArg.channel.id) {
            eventArg.channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor(Colors.Red)
                        .setDescription('The bot does not have permission to use this channel for music playback.')
                ],
            });
            return;
        }

        const query = args.join(" ");
        if (!query) {
            eventArg.channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor(Colors.Yellow)
                        .setDescription('Please provide a song name or URL!')
                ],
            });
            return;
        }

        const player = client.riffy.createConnection({
            guildId: eventArg.guild.id,
            voiceChannel: eventArg.member.voice.channel.id,
            textChannel: eventArg.channel.id,
            deaf: true,
        });

        try {
            const resolve = await client.riffy.resolve({ query: query, requester: eventArg.author });
            const { loadType, tracks, playlistInfo } = resolve;

            // Fetch volume setting from the database
            const volumeGuild = await db.mongoose.MusicChannel.findOne({ guild_id: eventArg.guild.id });

            // If no volume setting is found in the database, use the default volume (100)
            const volume = volumeGuild ? volumeGuild.volume : 100;
            player.setVolume(volume); // Set the volume to the stored value

            if (loadType === 'playlist') {
                for (const track of tracks) {
                    track.info.requester = eventArg.author;
                    player.queue.add(track);
                }

                eventArg.channel.send({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(Colors.Green)
                            .setTitle('Playlist Added')
                            .setDescription(`Added \`${tracks.length} tracks\` from **${playlistInfo.name}** to the queue.`)
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
                            .setTitle('Track Added')
                            .setDescription(`Added **${track.info.title}** to the queue.`)
                            .setURL(track.info.uri)
                    ],
                });

                if (!player.playing && !player.paused) player.play();
            } else {
                eventArg.channel.send({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(Colors.Red)
                            .setDescription('No results found for your query.')
                    ],
                });
            }
        } catch (error) {
            console.error('Error resolving query:', error);
            eventArg.channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor(Colors.Red)
                        .setDescription('An error occurred while trying to fetch the track. Please try again later.')
                ],
            });
        }
    }
};
