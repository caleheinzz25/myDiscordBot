import { EmbedBuilder, Colors } from 'discord.js';

/**
 * Handles the "clear" command to clear the music queue.
 * 
 * @param {Object} param0 - The parameters object.
 * @param {Object} param0.client - The Discord client instance.
 * @param {Object} param0.eventArg - The event argument containing message details.
 */
export default async ({ client, eventArg }) => {
    if (!eventArg.content.startsWith('!') || eventArg.author.bot) return;

    const args = eventArg.content.slice(1).trim().split(" ");
    const command = args.shift().toLowerCase();

    if (command === "clearq") {
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

        // Check if there are songs in the queue
        if (player.queue.length === 0) {
            return eventArg.channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor(Colors.Yellow)
                        .setDescription("⚠️ The queue is already empty.")
                        .setTimestamp(),
                ],
            });
        }

        // Clear the queue
        player.queue.clear();

        // Send confirmation embed
        eventArg.channel.send({
            embeds: [
                new EmbedBuilder()
                    .setColor(Colors.Green)
                    .setTitle("✅ Queue Cleared")
                    .setDescription("The music queue has been cleared successfully.")
                    .setFooter({ text: `Cleared by ${eventArg.author.tag}` })
                    .setTimestamp(),
            ],
        });
    }
};
