import { EmbedBuilder, Colors } from 'discord.js';

/**
 * Pauses the music player for the current guild.
 * 
 * @param {Object} param0 - The parameters object.
 * @param {Object} param0.client - The Discord client instance.
 * @param {Object} param0.eventArg - The event argument containing message details.
 */
export default async ({ client, eventArg }) => {
    // Extract command and arguments from the message
    const args = eventArg.content.slice(1).trim().split(" ");
    const command = args.shift().toLowerCase();

    if (command === "pause") {
        // Get the music player for the current guild
        const player = client.riffy.players.get(eventArg.guild.id);

        if (!player) {
            return eventArg.channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor(Colors.Red)
                        .setTitle("⚠️ No Player Found")
                        .setDescription("There is no active music player to pause in this server.")
                        .setTimestamp(),
                ],
            });
        }

        console.log(player);

        // Pause the player
        player.pause(true);

        // Send confirmation message
        eventArg.channel.send({
            embeds: [
                new EmbedBuilder()
                    .setColor(Colors.Blue)
                    .setTitle("⏸️ Player Paused")
                    .setDescription("The music player has been paused. Use the `resume` command to continue playback.")
                    .setTimestamp(),
            ],
        });
    }
};
