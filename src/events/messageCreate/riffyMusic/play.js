export default async ({ client, eventArg }) => {
    if (!eventArg.content.startsWith("!") || eventArg.author.bot) return;

    const args = eventArg.content.slice(1).trim().split(" ");
    const command = args.shift().toLowerCase();

    if (command === "play") {
        const query = args.join(" ");

        // Create a player.
        const player = client.riffy.createConnection({
            guildId: eventArg.guild.id,
            voiceChannel: eventArg.member.voice.channel.id,
            textChannel: eventArg.channel.id,
            deaf: true,
        });

        const resolve = await client.riffy.resolve({
            query: query,
            requester: eventArg.author,
        });
        const { loadType, tracks, playlistInfo } = resolve;

        /**
         * Important: If you are using Lavalink V3, here are the changes you need to make:
         *
         * 1. Replace "playlist" with "PLAYLIST_LOADED"
         * 2. Replace "search" with "SEARCH_RESULT"
         * 3. Replace "track" with "TRACK_LOADED"
         */

        if (loadType === "playlist") {
            for (const track of resolve.tracks) {
                track.info.requester = eventArg.author;
                player.queue.add(track);
            }

            eventArg.channel.send(
                `Added: \`${tracks.length} tracks\` from \`${playlistInfo.name}\``
            );
            if (!player.playing && !player.paused) return player.play();
        } else if (loadType === "search" || loadType === "track") {
            const track = tracks.shift();
            track.info.requester = eventArg.author;

            player.queue.add(track);
            eventArg.channel.send(`Added: \`${track.info.title}\``);
            if (!player.playing && !player.paused) return player.play();
        } else {
            return eventArg.channel.send("There are no results found.");
        }
    }
}