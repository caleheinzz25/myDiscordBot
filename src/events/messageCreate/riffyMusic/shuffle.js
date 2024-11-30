import { EmbedBuilder, Colors } from 'discord.js';

/**
 * Handles the "shuffle" command to randomize the order of songs in the queue.
 * 
 * @param {Object} param0 - The parameters object.
 * @param {Object} param0.client - The Discord client instance.
 * @param {Object} param0.eventArg - The event argument containing message details.
 */
export default async ({ client, eventArg }) => {
    if (!eventArg.content.startsWith('!') || eventArg.author.bot) return;

    const args = eventArg.content.slice(1).trim().split(" ");
    const command = args.shift().toLowerCase();

    if (command === "shuffle") {
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

        // Check if there are enough songs in the queue to shuffle
        if (player.queue.length < 2) {
            return eventArg.channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor(Colors.Yellow)
                        .setDescription("⚠️ The queue has fewer than 2 songs, so it cannot be shuffled.")
                        .setTimestamp(),
                ],
            });
        }

        // Shuffle the queue
        player.queue.shuffle();

        // Create the embed to confirm the shuffle
        const embed = new EmbedBuilder()
            .setColor(Colors.Green)
            .setTitle("🔀 Queue Shuffled")
            .setDescription("The queue has been successfully shuffled!")
            .addFields({ name: "Total Songs", value: `${player.queue.length}`, inline: true })
            .setTimestamp();

        eventArg.channel.send({ embeds: [embed] });
    }
};
