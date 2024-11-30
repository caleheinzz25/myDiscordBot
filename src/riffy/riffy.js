import { GatewayDispatchEvents, EmbedBuilder } from 'discord.js'

export const riffyInit = (client) => {
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
        // Ambil informasi pengguna dari cache client
        const requester = client.users.cache.get(track.info.requester.id) || { username: 'Unknown', displayAvatarURL: () => null };
    
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
        const autoplay = false;
    
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
    
}