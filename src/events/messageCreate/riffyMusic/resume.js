import { EmbedBuilder, Colors } from 'discord.js';

export default async ({ client, eventArg }) => {
    if (eventArg.content.startsWith('!') && !eventArg.author.bot) {
        const args = eventArg.content.slice(1).trim().split(" ");
        const command = args.shift().toLowerCase();

        if (command === "resume") {
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
                            .setDescription('You need to be in the same voice channel as the bot to resume the player.')
                    ],
                });
                return;
            }

            if (!player.queue.current) {
                eventArg.channel.send({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(Colors.Red)
                            .setDescription('There is no song currently paused to resume.')
                    ],
                });
                return;
            }

            if (!player.paused) {
                eventArg.channel.send({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(Colors.Yellow)
                            .setDescription('The player is already playing.')
                    ],
                });
                return;
            }

            // Resume the player
            player.pause(false);

            eventArg.channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor(Colors.Green)
                        .setTitle('Player Resumed')
                        .setDescription(`Resumed **${player.queue.current.info.title}**.`)
                ],
            });
            return;
        }
    }
};
