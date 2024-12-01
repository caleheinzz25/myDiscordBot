import { EmbedBuilder, Colors } from "discord.js";

/**
 * Handles the "auto" command to toggle autoplay on or off.
 * 
 * @param {Object} param0 - The parameters object.
 * @param {Object} param0.client - The Discord client instance.
 * @param {Object} param0.eventArg - The event argument containing message details.
 */
export default async ({ client, eventArg, db }) => {
    if (!eventArg.content.startsWith('!') || eventArg.author.bot) return;

    const args = eventArg.content.slice(1).trim().split(" ");
    const command = args.shift().toLowerCase();

    if (command === "auto") {
        const player = client.riffy.players.get(eventArg.guild.id);

        // Check if a player is active in the guild
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

        const channel = client.channels.cache.get(player.textChannel);
        const musicChannel = await db.mongoose.MusicChannel.findOne({ guild_id: eventArg.guild.id });

        // Ensure the database record exists
        if (!musicChannel) {
            return eventArg.channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor(Colors.Red)
                        .setDescription("❌ No music channel found in the database.")
                        .setTimestamp(),
                ],
            });
        }

        // Toggle autoplay based on the argument
        if (args[0]?.toLowerCase() === "on") {
            /**
             * Enable autoplay for the current player and update the database.
             */
            // player.autoplay(player);
            musicChannel.auto_play = true;  // Update the database field
            await musicChannel.save();  // Save the changes to the database

            channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor(Colors.Green)
                        .setDescription("✅ Autoplay has been enabled.")
                        .setTimestamp(),
                ],
            });
        } else if (args[0]?.toLowerCase() === "off") {
            /**
             * Disable autoplay for the current player and update the database.
             */
            // player.autoplay = false;
            musicChannel.auto_play = false;  // Update the database field
            await musicChannel.save();  // Save the changes to the database

            channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor(Colors.Yellow)
                        .setDescription("⚠️ Autoplay has been disabled.")
                        .setTimestamp(),
                ],
            });
        } else {
            /**
             * Send usage instructions if no valid argument is provided.
             */
            channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor(Colors.Blue)
                        .setTitle("🎛️ Autoplay Command")
                        .setDescription(
                            "Use `!auto on` to enable autoplay or `!auto off` to disable it."
                        )
                        .setFooter({ text: `Requested by ${eventArg.author.tag}` })
                        .setTimestamp(),
                ],
            });
        }
    }
};
