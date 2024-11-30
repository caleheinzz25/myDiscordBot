import { EmbedBuilder, Colors } from 'discord.js';

/**
 * Sets and saves the player's volume for the guild.
 * 
 * @param {Object} param0 - The parameters object.
 * @param {Object} param0.client - The Discord client instance.
 * @param {Object} param0.eventArg - The event argument containing message details.
 * @param {Object} param0.db - The database object for Mongoose models.
 */
export default async ({ client, eventArg, db }) => {
    if (!eventArg.content.startsWith('!') || eventArg.author.bot) return;

    const args = eventArg.content.slice(1).trim().split(" ");
    const command = args.shift().toLowerCase();

    if (command === "volume") {
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

        const volume = parseInt(args[0]);
        if (isNaN(volume) || volume < 0 || volume > 100) {
            return eventArg.channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor(Colors.Yellow)
                        .setDescription('🔊 Please provide a valid volume level (0-100).')
                        .setTimestamp()
                ],
            });
        }

        // Set the player's volume
        player.setVolume(volume);

        // Update or create the volume setting in the database
        await db.mongoose.MusicChannel.findOneAndUpdate(
            { guild_id: eventArg.guild.id },
            { $set: { volume: volume } },
            { upsert: true, new: true }
        );

        // Send confirmation message
        return eventArg.channel.send({
            embeds: [
                new EmbedBuilder()
                    .setColor(Colors.Green)
                    .setDescription(`🔊 Volume set to \`${volume}\` and saved successfully.`)
                    .setTimestamp()
            ],
        });
    }
};
