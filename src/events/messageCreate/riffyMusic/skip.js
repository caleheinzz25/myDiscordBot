// import { EmbedBuilder, Colors } from 'discord.js';

// export default async ({ client, eventArg }) => {
//     if (eventArg.content.startsWith('!') && !eventArg.author.bot) {
//         const args = eventArg.content.slice(1).trim().split(" ");
//         const command = args.shift().toLowerCase();

//         if (command === "skip") {
//             const player = client.riffy.players.get(eventArg.guild.id);
//             if (!player) {
//                 eventArg.channel.send({
//                     embeds: [
//                         new EmbedBuilder()
//                             .setColor(Colors.Red)
//                             .setDescription('No player found. Make sure there is an active player.')
//                     ],
//                 });
//                 return;
//             }

//             if (!eventArg.member.voice.channel || eventArg.member.voice.channel.id !== player.voiceChannel) {
//                 eventArg.channel.send({
//                     embeds: [
//                         new EmbedBuilder()
//                             .setColor(Colors.Yellow)
//                             .setDescription('You need to be in the same voice channel as the bot to skip songs.')
//                     ],
//                 });
//                 return;
//             }

//             if (!player.queue.current) {
//                 eventArg.channel.send({
//                     embeds: [
//                         new EmbedBuilder()
//                             .setColor(Colors.Red)
//                             .setDescription('No song is currently playing to skip.')
//                     ],
//                 });
//                 return;
//             }

//             const currentTrack = player.queue.current;

//             // Skip the current track
//             player.stop();

//             eventArg.channel.send({
//                 embeds: [
//                     new EmbedBuilder()
//                         .setColor(Colors.Green)
//                         .setTitle('Song Skipped')
//                         .setDescription(`Skipped **${currentTrack.info.title}**.`)
//                 ],
//             });
//             return;
//         }
//     }
// };
