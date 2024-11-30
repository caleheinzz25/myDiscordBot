import { EmbedBuilder, Colors } from 'discord.js';

/**
 * Handles the "queue" command to display the current music queue with improved visual feedback.
 * 
 * @param {Object} param0 - The parameters object.
 * @param {Object} param0.client - The Discord client instance.
 * @param {Object} param0.eventArg - The event argument containing message details.
 */
export default async ({ client, eventArg }) => {
    if (!eventArg.content.startsWith('!') || eventArg.author.bot) return;

    const args = eventArg.content.slice(1).trim().split(" ");
    const command = args.shift().toLowerCase();

    if (command === "queue") {
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

        const queue = player.queue;

        // Check if the queue has any songs
        if (!queue.length) {
            return eventArg.channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor(Colors.Yellow)
                        .setDescription("🎵 The queue is currently empty.")
                        .setTimestamp(),
                ],
            });
        }

        // Helper function to format duration as mm:ss
        const formatDuration = ms => {
            const minutes = Math.floor(ms / 60000);
            const seconds = Math.floor((ms % 60000) / 1000);
            return `${minutes}:${seconds.toString().padStart(2, '0')}`;
        };

        // Create the queue display string
        const queueDisplay = queue
            .map((track, i) => {
                if (!track.info) {
                    return `**${i + 1}.** Unknown Title by Unknown Author`; // Handle missing track info
                }
                const { title, author, uri, length } = track.info;
                return `**${i + 1}.** [${title}](${uri}) by **${author}** (${formatDuration(length)})`;
            })
            .join("\n");

        // Prepare the embed for the queue
        const embed = new EmbedBuilder()
            .setColor(Colors.Blue)
            .setTitle("🎶 Current Queue")
            .setDescription(queueDisplay)
            .setFooter({ text: `Total Songs: ${queue.length}` })
            .setTimestamp();

        // Check if there are any tracks to display with thumbnails
        if (queue[0].info.thumbnail) {
            embed.setThumbnail(queue[0].info.thumbnail);
        }

        eventArg.channel.send({ embeds: [embed] });
    }
};
