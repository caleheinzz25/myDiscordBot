import { EmbedBuilder } from 'discord.js';

/**
 * Handles incoming events and processes commands prefixed with '!'
 * 
 * @param {Object} param0 - The parameters object.
 * @param {Object} param0.client - The Discord client instance.
 * @param {Object} param0.eventArg - The event argument containing message details.
 * @returns {void}
 */
export default async ({ client, eventArg }) => {
    // Ignore messages that do not start with '!' or are sent by a bot
    if (!eventArg.content.startsWith('!') || eventArg.author.bot) return;

    /**
     * Extract command and arguments from the message
     * - Removes the prefix ('!')
     * - Splits the remaining content into command and arguments
     */
    const args = eventArg.content.slice(1).trim().split(" ");
    const command = args.shift().toLowerCase();

    // Handle the 'skip' command
    if (command === "skip") {
        const player = client.riffy.players.get(eventArg.guild.id);

        if (!player) {
            const noPlayerEmbed = new EmbedBuilder()
                .setColor("#FF0000") // Red for error
                .setTitle("⚠️ Error")
                .setDescription("No player found.")
                .setTimestamp();

            return eventArg.channel.send({ embeds: [noPlayerEmbed] });
        }

        player.stop();

        const skippedEmbed = new EmbedBuilder()
            .setColor("#00FF00") // Green for success
            .setTitle("⏭️ Skipped")
            .setDescription("Skipped the current song.")
            .setTimestamp();

        eventArg.channel.send({ embeds: [skippedEmbed] });
    }

    // Add additional commands below as needed
};
