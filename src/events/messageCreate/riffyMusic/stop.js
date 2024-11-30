import { EmbedBuilder, Colors } from 'discord.js';

export default async ({ client, eventArg }) => {
    if (eventArg.content.startsWith('!') && !eventArg.author.bot) {
        const args = eventArg.content.slice(1).trim().split(" ");
        const command = args.shift().toLowerCase();

        if (command === "stop") {
            const player = client.riffy.players.get(eventArg.guild.id);
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

            if (!eventArg.member.voice.channel || eventArg.member.voice.channel.id !== player.voiceChannel) {
                eventArg.channel.send({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(Colors.Yellow)
                            .setDescription('You need to be in the same voice channel as the bot to stop the player.')
                    ],
                });
                return;
            }

            // Destroy the player and disconnect the bot
            player.destroy();

            eventArg.channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor(Colors.Green)
                        .setTitle('Player Stopped')
                        .setDescription('The player has been stopped, and the bot has disconnected from the voice channel.')
                ],
            });
            return;
        }
    }
};
