import { EmbedBuilder, Colors } from 'discord.js';

export default async ({ client, eventArg, db }) => {
    if (eventArg.content.startsWith('!') && !eventArg.author.bot) {
        const args = eventArg.content.slice(1).trim().split(" ");
        const command = args.shift().toLowerCase();

        if (command === "volume") {
            const player = client.riffy.players.get(eventArg.guild.id);
            const volume = parseInt(args[0]);

            if (!player) {
                eventArg.channel.send({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(Colors.Red)
                            .setDescription('No active player found in this server.')
                    ],
                });
                return;
            }

            // Check if volume is valid (between 0 and 100)
            if (!volume || isNaN(volume) || volume < 0 || volume > 100) {
                eventArg.channel.send({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(Colors.Yellow)
                            .setDescription('Please provide a valid volume between 0 and 100.')
                    ],
                });
                return;
            }

            player.setVolume(volume);

            // Store the volume in the database for the guild
            let volumeGuild = await db.mongoose.MusicChannel.findOne({ guild_id: eventArg.guild.id });
            if (!volumeGuild) {
                // If no volume setting exists, create a new one
                volumeGuild = new db.mongoose.MusicChannel({
                    guild_id: eventArg.guild.id,
                    volume: volume,
                });
            } else {
                // Update the existing volume setting
                volumeGuild.volume = volume;
            }
            await volumeGuild.save(); // Save the volume to the database

            console.log("Volume updated successfully!");

            // Send confirmation message with the updated volume
            eventArg.channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor(Colors.Green)
                        .setDescription(`Set the player volume to: \`${volume}\`.`)
                ],
            });
        }
    }
};
