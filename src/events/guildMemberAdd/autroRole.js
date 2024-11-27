import { Client, GuildMember } from 'discord.js';

/**
 *
 * @param {Client} client
 * @param {GuildMember} member
 */
export default async (client, member, db) => {
  try {
    const guild = member.guild;
    if (!guild) return;

    const autoRole = await db.mongoose.autoRoleSchema.findOne({ guild_id: guild.id });
    if (!db.mongoose.autoRoleSchema) return;

    await member.roles.add(autoRole.role_id);
  } catch (error) {
    console.log(`Error giving role automatically: ${error}`);
  }
}
