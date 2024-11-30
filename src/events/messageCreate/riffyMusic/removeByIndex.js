import { EmbedBuilder, Colors } from 'discord.js';

/**
 * Handles the "remove" command to delete a specific track from the queue.
 * 
 * @param {Object} param0 - The parameters object.
 * @param {Object} param0.client - The Discord client instance.
 * @param {Object} param0.eventArg - The event argument containing message details.
 */
export default async ({ client, eventArg }) => {
    if (!eventArg.content.startsWith('!') || eventArg.author.bot) return;

    const args = eventArg.content.slice(1).trim().split(" ");
    const command = args.shift().toLowerCase();

    if (command === "remove") {
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

        const index = parseInt(args[0]);

        // Validate the input index
        if (isNaN(index) || index < 1 || index > player.queue.length) {
            return eventArg.channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor(Colors.Yellow)
                        .setDescription("⚠️ Please provide a valid track number within the queue range.")
                        .setFooter({ text: `Valid range: 1 to ${player.queue.length}` })
                        .setTimestamp(),
                ],
            });
        }

        // Remove the track from the queue
        const removed = player.queue.remove(index - 1);

        // Confirm the removal with an embed
        const embed = new EmbedBuilder()
            .setColor(Colors.Green)
            .setTitle("✅ Track Removed")
            .setDescription(`Removed **[${removed.info.title}](${removed.info.uri})** from the queue.`)
            .addFields({ name: "Requested By", value: `${removed.info.requester.tag}`, inline: true })
            .setTimestamp();

        eventArg.channel.send({ embeds: [embed] });
    }
};
