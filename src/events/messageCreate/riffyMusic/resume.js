import { EmbedBuilder, Colors } from 'discord.js';

/**
 * Resumes the currently paused player for the guild.
 * 
 * @param {Object} param0 - The parameters object.
 * @param {Object} param0.client - The Discord client instance.
 * @param {Object} param0.eventArg - The event argument containing message details.
 */
export default async ({ client, eventArg }) => {
    if (!eventArg.content.startsWith('!') || eventArg.author.bot) return;

    const args = eventArg.content.slice(1).trim().split(" ");
    const command = args.shift().toLowerCase();

    if (command === "resume") {
        const player = client.riffy.players.get(eventArg.guild.id);

        // Check if a player exists
        if (!player) {
            return eventArg.channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor(Colors.Red)
                        .setDescription('⚠️ No active player found for this guild.')
                        .setTimestamp()
                ],
            });
        }

        // Resume the player
        player.pause(false);

        // Send confirmation
        eventArg.channel.send({
            embeds: [
                new EmbedBuilder()
                    .setColor(Colors.Green)
                    .setDescription('▶️ Resumed playback successfully.')
                    .setTimestamp()
            ],
        });
    }
};
