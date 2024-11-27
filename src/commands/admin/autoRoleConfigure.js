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
  callback: async ({ client, interaction, db: { mongoose } }) => {
    if (!interaction.inGuild()) {
        interaction.reply('You can only run this command inside a server.');
        return;
    }

    const targetRoleId = interaction.options.get('role').value;

    try {
        await interaction.deferReply();

        // Cari dokumen autoRole berdasarkan guild_id
        let autoRole = await mongoose.autoRoleSchema.findOne({ guild_id: interaction.guild.id });

        // Jika autoRole tidak ditemukan
        if (!autoRole) {
            autoRole = new mongoose.autoRoleSchema({
                guild_id: interaction.guild.id,
                role_id: targetRoleId,
            });

            await autoRole.save();
            interaction.editReply(`Autorole has now been configured with role <@&${targetRoleId}>.`);
            return;
        }

        // Ambil role dari ID yang ada di autoRole
        const role = await interaction.guild.roles.fetch(autoRole.role_id);

        if (autoRole.role_id === targetRoleId) {
            interaction.editReply(`Auto role ${role} has already been configured for that role. To disable, run '/autorole-disable'.`);
            return;
        }

        // Update autoRole dengan role baru
        autoRole.role_id = targetRoleId;
        await autoRole.save();

        interaction.editReply(`Autorole has now been updated to role <@&${targetRoleId}>. To disable, run '/autorole-disable'.`);
    } catch (error) {
        console.error('Error configuring autorole:', error);
        interaction.editReply('There was an error configuring the autorole. Please try again later.');
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
