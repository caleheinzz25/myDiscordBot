// import { config } from "../../utils/logger.js";

// export default async (client, message) => {
//     // Early exit if no author or the author is a bot
//     if (!message?.author || message.author.bot) return;

//     const badWords = config.badWords;
//     const messageContent = message.content.toLowerCase();

//     // Check if the message contains any bad words (case-insensitive)
//     const containsBadWords = badWords.some(word => messageContent.includes(word.toLowerCase()));

//     if (containsBadWords) {
//         try {
//             // Delete the message
//             await message.delete();

//             // Create warning message
//             const warningMessage = `Pesan dari ${message.author.tag} telah dihapus karena mengandung kata-kata yang tidak pantas.`;

//             // Send warning to log channel
//             const logChannel = message.guild?.channels.cache.get('log-channel-id');
//             if (logChannel?.isText()) await logChannel.send(warningMessage);

//             // Send direct message to the user
//             await message.author.send('Pesan Anda telah dihapus karena mengandung kata-kata yang tidak pantas.');
//         } catch (error) {
//             console.error('Error deleting message or sending warning:', error);
//         }
//     }
// };
