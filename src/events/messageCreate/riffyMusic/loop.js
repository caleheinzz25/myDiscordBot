import { EmbedBuilder, Colors } from 'discord.js';

/**
 * Handles the "loop" command to toggle looping for the queue or the current track.
 * 
 * @param {Object} param0 - The parameters object.
 * @param {Object} param0.client - The Discord client instance.
 * @param {Object} param0.eventArg - The event argument containing message details.
 */
export default async ({ client, eventArg }) => {
    if (!eventArg.content.startsWith('!') || eventArg.author.bot) return;

    const args = eventArg.content.slice(1).trim().split(" ");
    const command = args.shift().toLowerCase();

    if (command === "loop") {
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

        const loop = args[0];

        // Validate the loop argument
        if (!loop || !["queue", "track"].includes(loop)) {
            return eventArg.channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor(Colors.Yellow)
                        .setDescription("⚠️ Please provide a valid loop option: `queue` or `track`.")
                        .setTimestamp(),
                ],
            });
        }

        // Toggle the loop setting
        const currentLoop = player.loop;
        const newLoop = currentLoop === loop ? "none" : loop;
        player.setLoop(newLoop);

        const embed = new EmbedBuilder()
            .setColor(newLoop === "none" ? Colors.Grey : Colors.Blue)
            .setTitle("🔁 Loop Setting Updated")
            .setDescription(
                `${loop.charAt(0).toUpperCase() + loop.slice(1)} loop is now **${newLoop === "none" ? "disabled" : "enabled"}**.`
            )
            .addFields(
                { name: "Current Loop", value: `**${newLoop}**`, inline: true },
                { name: "Previous Loop", value: `**${currentLoop}**`, inline: true }
            )
            .setTimestamp();

        eventArg.channel.send({ embeds: [embed] });
    }
};
