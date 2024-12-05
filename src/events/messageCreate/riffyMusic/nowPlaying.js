import { EmbedBuilder, Colors } from 'discord.js';

/**
 * Handles the "nowplaying" command to display the currently playing song with improved visual feedback.
 * 
 * @param {Object} param0 - The parameters object.
 * @param {Object} param0.client - The Discord client instance.
 * @param {Object} param0.eventArg - The event argument containing message details.
 */
export default async ({ client, eventArg }) => {
    if (!eventArg.content.startsWith('!') || eventArg.author.bot) return;

    const args = eventArg.content.slice(1).trim().split(" ");
    const command = args.shift().toLowerCase();

    if (command === "now") {
        const player = client.riffy.players.get(eventArg.guild.id);

        // Check if the player exists
        if (!player) {
            return eventArg.channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor(Colors.Red)
                        .setDescription("❌ No player found in this guild.")
                        .setTimestamp(),
                ],
            });
        }

        const track = player.current;

        // Check if a track is currently playing
        if (!track) {
            return eventArg.channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor(Colors.Yellow)
                        .setDescription("🎵 No song currently playing.")
                        .setTimestamp(),
                ],
            });
        }

        // Create an embed with improved formatting
        const requester = client.users.cache.get(track.info.requester.id) || { username: 'Unknown', displayAvatarURL: () => null };

        const embed = new EmbedBuilder()
            .setColor(Colors.Green)
            .setTitle("🎶 Now Playing")
            .setDescription(`[${track.info.title}](${track.info.uri})`)
            .addFields(
                { name: 'Author', value: track.info.author, inline: true },
                { name: "Duration", value: formatDuration(track.info.length), inline: true },
            )
            .setThumbnail(track.info.thumbnail || 'https://i.imgur.com/AfFp7pu.png') // Default thumbnail if none exists
            .setURL(track.info.uri)
            .setFooter({
                text: `Requested by ${requester.username}`,
                iconURL: requester.displayAvatarURL(),
            })
            .setTimestamp();
    
        // Send the embed message
        eventArg.channel.send({ embeds: [embed] });
    }
};

// Helper function to format the duration as mm:ss
const formatDuration = ms => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};
