import { EmbedBuilder, Colors } from "discord.js";

/**
 * Handles the "filters" command to display active filters.
 * 
 * @param {Object} param0 - The parameters object.
 * @param {Object} param0.client - The Discord client instance.
 * @param {Object} param0.eventArg - The event argument containing message details.
 */
export default async ({ client, eventArg }) => {
    if (!eventArg.content.startsWith('!') || eventArg.author.bot) return;

    const args = eventArg.content.slice(1).trim().split(" ");
    const command = args.shift().toLowerCase();

    if (command === "filters") {
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

        // List of all available filters
        const filterActions = {
            "8d": "set8D",
            bassboost: "setBassboost",
            channelmix: "setChannelMix",
            distortion: "setDistortion",
            karaoke: "setKaraoke",
            lowpass: "setLowPass",
            nightcore: "setNightcore",
            rotate: "setRotation",
            slowmode: "setSlowmode",
            timescale: "setTimescale",
            tremolo: "setTremolo",
            vaporwave: "setVaporwave",
            vibrato: "setVibrato",
        };

        // Check active filters
        const activeFilters = Object.keys(filterActions).filter((filterName) => {
            return player.filters[filterName]; // Assume this returns the filter state
        });

        // Prepare the response
        const embed = new EmbedBuilder()
            .setColor(Colors.Blue)
            .setTitle("🎛️ Active Filters")
            .setDescription(
                activeFilters.length > 0
                    ? activeFilters.map((filter) => `✅ **${filter}**`).join("\n")
                    : "No active filters."
            )
            .setFooter({ text: `Requested by ${eventArg.author.tag}` })
            .setTimestamp();

        eventArg.channel.send({ embeds: [embed] });
    }
};
