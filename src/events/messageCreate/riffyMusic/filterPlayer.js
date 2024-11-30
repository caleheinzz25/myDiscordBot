import { EmbedBuilder, Colors } from 'discord.js';


/**
 * Handles the "filter" command to apply audio filters.
 * 
 * @param {Object} param0 - The parameters object.
 * @param {Object} param0.client - The Discord client instance.
 * @param {Object} param0.eventArg - The event argument containing message details.
 */
export default async ({ client, eventArg, db }) => {
    if (!eventArg.content.startsWith('!') || eventArg.author.bot) return;

    const args = eventArg.content.slice(1).trim().split(" ");
    const command = args.shift().toLowerCase();

    if (command === "filter") {
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

        const filter = args[0]?.toLowerCase();
        const filterActions = {
            "8d": { method: "set8D", description: "8D filter enabled." },
            bassboost: { method: "setBassboost", description: "Bassboost filter enabled." },
            channelmix: { method: "setChannelMix", description: "Channelmix filter enabled." },
            distortion: { method: "setDistortion", description: "Distortion filter enabled." },
            karaoke: { method: "setKaraoke", description: "Karaoke filter enabled." },
            lowpass: { method: "setLowPass", description: "Lowpass filter enabled." },
            nightcore: { method: "setNightcore", description: "Nightcore filter enabled." },
            rotate: { method: "setRotation", description: "Rotate filter enabled." },
            slowmode: { method: "setSlowmode", description: "Slowmode filter enabled." },
            timescale: { method: "setTimescale", description: "Timescale filter enabled." },
            tremolo: { method: "setTremolo", description: "Tremolo filter enabled." },
            vaporwave: { method: "setVaporwave", description: "Vaporwave filter enabled." },
            vibrato: { method: "setVibrato", description: "Vibrato filter enabled." },
        };

        const action = filterActions[filter];
        if (action) {
            // Apply the filter
            player.filters[action.method](true);

            // Store the applied filter in the database
            const guildData = await db.mongoose.MusicChannel.findOne({ guild_id: eventArg.guild.id });

            if (!guildData) {
                // If no record exists, create a new one
                await db.mongoose.MusicChannel.create({
                    guild_id: eventArg.guild.id,
                    channel_id: eventArg.channel.id,
                    filters: [filter],  // Store the applied filter
                });
            } else {
                // If a record exists, update the filters array
                guildData.filters.push(filter);
                await guildData.save();
            }

            return eventArg.channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor(Colors.Green)
                        .setTitle("🔊 Filter Applied")
                        .setDescription(`✅ ${action.description}`)
                        .setFooter({ text: `Applied by ${eventArg.author.tag}` })
                        .setTimestamp(),
                ],
            });
        }

        // Invalid filter feedback
        return eventArg.channel.send({
            embeds: [
                new EmbedBuilder()
                    .setColor(Colors.Yellow)
                    .setTitle("⚠️ Invalid Filter")
                    .setDescription(
                        "Please provide a valid filter option. Available filters:\n" +
                        Object.keys(filterActions).map(f => `\`${f}\``).join(", ")
                    )
                    .setFooter({ text: "Use a valid filter name." })
                    .setTimestamp(),
            ],
        });
    }
};
