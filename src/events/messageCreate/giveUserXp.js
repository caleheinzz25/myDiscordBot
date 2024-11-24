import { Client, Message } from 'discord.js';
import { calculateLevelXp, getObjectModules, config } from '../../utils/logger.js';

const { mongoose: { levelSchema } } = await getObjectModules("src/db", "mongoose", true);
const cooldowns = new Set();

/**
 * Returns a random XP value between the given range.
 *
 * @param {Number} min Minimum XP value.
 * @param {Number} max Maximum XP value.
 * @returns {Number} Random XP value.
 */
function getRandomXp(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Handles XP distribution and leveling up for messages.
 *
 * @param {Client} client Discord client instance.
 * @param {Message} message The message object.
 */
export default async (client, message) => {
    // Early return conditions
    if (!message.inGuild() || message.author.bot || cooldowns.has(message.author.id)) return;

    const xpToGive = getRandomXp(5, 20);
    const query = { user_id: message.author.id, guild_id: message.guild.id };

    try {
        // Fetch the user's current level data
        let level = await levelSchema.findOne(query);
        
        // Get the designated level-up announcements channel
        const levelUpChannel = message.guild.channels.cache.get(config.channels.levelUp); // Replace with your channel ID
        
        if (!levelUpChannel) {
            console.error('Level-up announcement channel not found!');
            return;
        }

        if (level) {
            // Add XP and check for leveling up
            level.xp += xpToGive;

            if (level.xp >= calculateLevelXp(level.level)) {
                level.xp = 0; // Reset XP
                level.level += 1; // Level up
                
                // Send level-up message to the designated channel
                levelUpChannel.send(`${message.member} has leveled up to **level ${level.level}**!`)
                    .catch(err => console.error('Error sending level-up message:', err));
            }
            
            await level.save();
        } else {
            // If no level data exists, create a new entry
            level = new levelSchema({
                user_id: message.author.id,
                guild_id: message.guild.id,
                xp: xpToGive,
                level: 1, // Starting at level 1
            });
            
            await level.save();
        }

        // Cooldown handling
        cooldowns.add(message.author.id);
        setTimeout(() => cooldowns.delete(message.author.id), 50);
        
    } catch (error) {
        console.error(`Error giving xp: ${error}`);
    }
};