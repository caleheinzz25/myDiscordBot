import { EmbedBuilder, Colors } from "discord.js";

/**
 * Handles the "cfilter" command to clear all audio filters.
 * 
 * @param {Object} param0 - The parameters object.
 * @param {Object} param0.client - The Discord client instance.
 * @param {Object} param0.eventArg - The event argument containing message details.
 */
export default async ({ client, eventArg, db }) => {
    if (!eventArg.content.startsWith('!') || eventArg.author.bot) return;

    const args = eventArg.content.slice(1).trim().split(" ");
    const command = args.shift().toLowerCase();

    if (command === "cfilter") {
        const player = client.riffy.players.get(eventArg.guild.id);
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

        // Define all available filter actions
        const filterActions = {
            "8d": { method: "set8D" },
            bassboost: { method: "setBassboost" },
            channelmix: { method: "setChannelMix" },
            distortion: { method: "setDistortion" },
            karaoke: { method: "setKaraoke" },
            lowpass: { method: "setLowPass" },
            nightcore: { method: "setNightcore" },
            rotate: { method: "setRotation" },
            slowmode: { method: "setSlowmode" },
            timescale: { method: "setTimescale" },
            tremolo: { method: "setTremolo" },
            vaporwave: { method: "setVaporwave" },
            vibrato: { method: "setVibrato" },
        };

        // Clear all filters from the player
        Object.keys(filterActions).forEach((filterKey) => {
            const action = filterActions[filterKey];
            player.filters[action.method](false); // Disable each filter
        });

        // Clear all filters in the database
        await db.mongoose.MusicChannel.findOneAndUpdate(
            { guild_id: eventArg.guild.id },
            { $set: { filters: [] } }, // Clear the filters array
            { new: true }
        );

        // Send confirmation message
        eventArg.channel.send({
            embeds: [
                new EmbedBuilder()
                    .setColor(Colors.Green)
                    .setDescription("✅ All filters have been cleared.")
                    .setFooter({ text: `Requested by ${eventArg.author.tag}` })
                    .setTimestamp(),
            ],
        });
    }
};
