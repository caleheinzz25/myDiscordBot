// import config from '../../../config/config.json' with { type: "json" };

// export const anjay = async ({ eventArg, db }) => {
//     // Retrieve the music channel from the database
//     const musicChannel = await db.mongoose.MusicChannel.findOne({ guild_id: eventArg.guild.id });

//     // Check if the event is from the correct server, the message starts with '!', the sender is not a bot, and the channel is not the music channel
//     if (
//         eventArg.guild.id !== config.testServer &&  // Not in test server
//         eventArg.content.startsWith('!') &&        // Command starts with '!'
//         !eventArg.author.bot &&                     // Sender is not a bot
//         musicChannel.channel_id === eventArg.channel.id // Channel in the music channel
//     ) {
//         // Send maintenance message if the conditions match
//         return eventArg.channel.send(
//             "⚙️ **AI Under Maintenance** ⚙️\n\nHello there! The Bot is currently undergoing maintenance to improve its functionality and provide you with a better experience. Thank you for your understanding and patience! 🚀"
//         );
//     }
// };
