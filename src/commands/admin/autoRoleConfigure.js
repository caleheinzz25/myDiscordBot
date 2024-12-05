import { ApplicationCommandOptionType, Client, CommandInteraction, PermissionFlagsBits } from 'discord.js';
// import { getObjectModules } from '../../utils/logger.js';
import { userSchema } from '../../db/mongoose/schemas/User.js';

import { model } from 'mongoose';
// Dynamic import for mongoose schema
// const { mongoose: { autoRoleSchema } } = await getObjectModules("src/db", "mongoose", true);

export default {
  /**
   *
   * @param {Client} client
   * @param {CommandInteraction} interaction
   * @param {} haha
   */
  callback: async ({ client, eventArg, db: { mongoose } }) => {
    if (!eventArg.inGuild()) {
        eventArg.reply('You can only run this command inside a server.');
        return;
    }

    const targetRoleId = eventArg.options.get('role').value;

    try {
        await eventArg.deferReply();

        // Cari dokumen autoRole berdasarkan guild_id
        let autoRole = await mongoose.autoRoleSchema.findOne({ guild_id: eventArg.guild.id });

        // Jika autoRole tidak ditemukan
        if (!autoRole) {
            autoRole = new mongoose.autoRoleSchema({
                guild_id: eventArg.guild.id,
                role_id: targetRoleId,
            });

            await autoRole.save();
            eventArg.editReply(`Autorole has now been configured with role <@&${targetRoleId}>.`);
            return;
        }

        // Ambil role dari ID yang ada di autoRole
        const role = await eventArg.guild.roles.fetch(autoRole.role_id);

        if (autoRole.role_id === targetRoleId) {
            eventArg.editReply(`Auto role ${role} has already been configured for that role. To disable, run '/autorole-disable'.`);
            return;
        }

        // Update autoRole dengan role baru
        autoRole.role_id = targetRoleId;
        await autoRole.save();

        eventArg.editReply(`Autorole has now been updated to role <@&${targetRoleId}>. To disable, run '/autorole-disable'.`);
    } catch (error) {
        console.error('Error configuring autorole:', error);
        eventArg.editReply('There was an error configuring the autorole. Please try again later.');
      }
  },
  db: [
    "mongoose"
  ],
  // deleted: true,
  command:{
    name: 'autorole-configure',
    description: 'Configure your auto-role for this server.',
    options: [
      {
        name: 'role',
        description: 'The role you want users to get on join.',
        type: ApplicationCommandOptionType.Role,
        required: true,
      },
    ]
  },
  permissionsRequired: [PermissionFlagsBits.Administrator],
  botPermissions: [PermissionFlagsBits.ManageRoles],
};
