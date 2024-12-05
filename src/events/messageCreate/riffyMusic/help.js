import { EmbedBuilder, Colors } from "discord.js";

/**
 * Handles the "help" command to display available commands and their descriptions.
 * 
 * @param {Object} param0 - The parameters object.
 * @param {Object} param0.eventArg - The event argument containing message details.
 */
export default async ({ eventArg }) => {
    if (!eventArg.content.startsWith('!') || eventArg.author.bot) return;

    const args = eventArg.content.slice(1).trim().split(" ");
    const command = args.shift().toLowerCase();

    if (command === "help") {
        // List of commands and their descriptions
        const commands = [
            { name: "auto", description: "Toggle autoplay on/off if the queue ends." },
            { name: "clearf", description: "Clear all filters." },
            { name: "clearq", description: "Clear all the queue." },
            { name: "delete", description: "Remove one filter by name." },
            { name: "filter", description: "Add one filter by name." },
            { name: "helpf", description: "View all filter configurations." },
            { name: "loop", description: "Set loop type for the player (queue or track)." },
            { name: "now", description: "Show the music currently playing." },
            { name: "pause", description: "Pause the player." },
            { name: "p", description: "Insert a music name or link to request a song." },
            { name: "queue", description: "Show all the songs in the queue." },
            { name: "remove", description: "Remove a song from the queue by index." },
            { name: "resume", description: "Resume the player." },
            { name: "filters", description: "Show the active filters." },
            { name: "shuffle", description: "Shuffle the music queue." },
            { name: "skip", description: "Skip the current song." },
            { name: "stop", description: "Stop the player and leave the voice channel." },
            { name: "volume", description: "Set the volume for the player." },
        ];

        // Create embed message
        const embed = new EmbedBuilder()
            .setColor(Colors.Blue)
            .setTitle("🎵 Music Bot Commands")
            .setDescription("Here are all the available commands:")
            .setFooter({ text: `Requested by ${eventArg.author.tag}` })
            .setTimestamp();

        // Add commands to the embed
        commands.forEach((cmd) => {
            embed.addFields({ name: `\`!${cmd.name}\``, value: cmd.description, inline: false });
        });

        // Send the embed
        return eventArg.channel.send({ embeds: [embed] });
    }
};
