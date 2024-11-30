import { EmbedBuilder, Colors } from 'discord.js';

/**
 * Stops the music player and disconnects from the voice channel.
 * 
 * @param {Object} param0 - The parameters object.
 * @param {Object} param0.client - The Discord client instance.
 * @param {Object} param0.eventArg - The event argument containing message details.
 */
export default async ({ client, eventArg }) => {
    // Extract command and arguments from the message
    const args = eventArg.content.slice(1).trim().split(" ");
    const command = args.shift().toLowerCase();

    if (command === "stop") {
        // Get the music player for the current guild
        const player = client.riffy.players.get(eventArg.guild.id);
        
        if (!player) {
            return eventArg.channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor(Colors.Red)
                        .setTitle("⚠️ No Player Found")
                        .setDescription("There is no active music player for this server.")
                        .setTimestamp(),
                ],
            });
        }

        // Destroy the player and disconnect from the voice channel
        player.destroy();

        // Send confirmation message
        eventArg.channel.send({
            embeds: [
                new EmbedBuilder()
                    .setColor(Colors.Green)
                    .setTitle("🛑 Player Stopped")
                    .setDescription("The music player has been stopped and disconnected from the voice channel.")
                    .setTimestamp(),
            ],
        });
    }
};
