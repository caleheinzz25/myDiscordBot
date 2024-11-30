import { Client, GuildMember } from 'discord.js';

/**
 *
 * @param {Client} client
 * @param {GuildMember} eventArg
 */
export default async ({client, eventArg, db}) => {
  try {
    const guild = eventArg.guild;
    if (!guild) return;

    const autoRole = await db.mongoose.autoRoleSchema.findOne({ guild_id: guild.id });
    if (!db.mongoose.autoRoleSchema) return;

    await eventArg.roles.add(autoRole.role_id);
  } catch (error) {
    console.log(`Error giving role automatically: ${error}`);
  }
}
