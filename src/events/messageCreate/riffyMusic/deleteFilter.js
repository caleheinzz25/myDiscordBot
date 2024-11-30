import { EmbedBuilder, Colors } from "discord.js";

/**
 * Handles the "dfilter" command to disable a specific audio filter.
 * 
 * @param {Object} param0 - The parameters object.
 * @param {Object} param0.client - The Discord client instance.
 * @param {Object} param0.eventArg - The event argument containing message details.
 */
export default async ({ client, eventArg, db }) => {
    if (!eventArg.content.startsWith('!') || eventArg.author.bot) return;

    const args = eventArg.content.slice(1).trim().split(" ");
    const command = args.shift().toLowerCase();

    if (command === "dfilter") {
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

        const filter = args[0]?.toLowerCase();

        // Define filter actions
        const filterActions = {
            "8d": { method: "set8D", eventArg: "8D filter has been disabled." },
            bassboost: { method: "setBassboost", eventArg: "Bassboost filter has been disabled." },
            channelmix: { method: "setChannelMix", eventArg: "Channelmix filter has been disabled." },
            distortion: { method: "setDistortion", eventArg: "Distortion filter has been disabled." },
            karaoke: { method: "setKaraoke", eventArg: "Karaoke filter has been disabled." },
            lowpass: { method: "setLowPass", eventArg: "Lowpass filter has been disabled." },
            nightcore: { method: "setNightcore", eventArg: "Nightcore filter has been disabled." },
            rotate: { method: "setRotation", eventArg: "Rotate filter has been disabled." },
            slowmode: { method: "setSlowmode", eventArg: "Slowmode filter has been disabled." },
            timescale: { method: "setTimescale", eventArg: "Timescale filter has been disabled." },
            tremolo: { method: "setTremolo", eventArg: "Tremolo filter has been disabled." },
            vaporwave: { method: "setVaporwave", eventArg: "Vaporwave filter has been disabled." },
            vibrato: { method: "setVibrato", eventArg: "Vibrato filter has been disabled." },
        };

        const action = filterActions[filter];

        if (action) {
            // Disable the filter in the player
            player.filters[action.method](false);

            // Remove the filter from the database
            await db.mongoose.MusicChannel.findOneAndUpdate(
                { guild_id: eventArg.guild.id },
                { $pull: { filters: filter } }, // Pull (remove) the filter from the filters array
                { new: true }
            );

            eventArg.channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor(Colors.Green)
                        .setDescription(`✅ ${action.eventArg}`)
                        .setFooter({ text: `Requested by ${eventArg.author.tag}` })
                        .setTimestamp(),
                ],
            });
        } else {
            eventArg.channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor(Colors.Yellow)
                        .setDescription("⚠️ Please provide a valid filter option.")
                        .setFooter({ text: "Use `!hfilter` to see all available filters." })
                        .setTimestamp(),
                ],
            });
        }
    }
};
