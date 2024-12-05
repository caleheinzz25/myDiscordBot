import { EmbedBuilder, Colors } from "discord.js";

/**
 * Handles the "hfilter" command to display all available filters with descriptions.
 * 
 * @param {Object} param0 - The parameters object.
 * @param {Object} param0.eventArg - The event argument containing message details.
 */
export default async ({ eventArg }) => {
    if (!eventArg.content.startsWith('!') || eventArg.author.bot) return;

    const args = eventArg.content.slice(1).trim().split(" ");
    const command = args.shift().toLowerCase();

    if (command === "helpf") {
        const filters = {
            "8d": "Applies a spatial effect that makes the audio feel like it's moving around you.",
            bassboost: "Increases the bass frequencies for a deeper sound.",
            channelmix: "Balances the audio channels for a unique stereo effect.",
            distortion: "Adds a distorted effect to the audio for a grungy feel.",
            karaoke: "Removes vocals from the track to create a karaoke-like experience.",
            lowpass: "Applies a lowpass filter, reducing high frequencies for a mellow sound.",
            nightcore: "Speeds up the track with a higher pitch, creating a Nightcore effect.",
            rotate: "Rotates the audio channels for a swirling sound effect.",
            slowmode: "Slows down the track for a relaxed, drawn-out effect.",
            timescale: "Applies custom time and pitch scaling for a unique sound.",
            tremolo: "Adds a vibrating effect to the audio by modulating the amplitude.",
            vaporwave: "Slows down and lowers the pitch for a vaporwave aesthetic.",
            vibrato: "Adds a pitch modulation effect for a wavy sound.",
        };

        // Create the embed with filter options
        const embed = new EmbedBuilder()
            .setColor(Colors.Blurple)
            .setTitle("Available Filters")
            .setDescription("Here are the audio filters you can use with the `!filter` command:")
            .addFields(
                Object.entries(filters).map(([filter, description]) => ({
                    name: `\`${filter}\``,
                    value: description,
                    inline: true,
                }))
            )
            .setFooter({ text: `Requested by ${eventArg.author.tag}` })
            .setTimestamp();

        eventArg.channel.send({ embeds: [embed] });
    }
};
