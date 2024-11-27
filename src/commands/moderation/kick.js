  import {
      ApplicationCommandOptionType,
      PermissionFlagsBits,
    } from 'discord.js';
    
    export default {
      command:{
        name: 'kick',
        description: 'Kicks a member from this server.',
        options: [
          {
            name: 'target-user',
            description: 'The user you want to kick.',
            type: ApplicationCommandOptionType.User,
            required: true,
          },
          {
            name: 'reason',
            description: 'The reason for the kick.',
            type: ApplicationCommandOptionType.String,
          },
        ]
      },
      permissionsRequired: [PermissionFlagsBits.KickMembers],
      botPermissions: [PermissionFlagsBits.KickMembers],
    
      callback: async ({client, interaction}) => {
        try {
          const targetUserId = interaction.options.get('target-user').value;
          const reason =
            interaction.options.get('reason')?.value || 'No reason provided';
    
          await interaction.deferReply();
    
          const targetUser = await interaction.guild.members.fetch(targetUserId);
    
          if (!targetUser) {
            return interaction.editReply("That user doesn't exist in this server.");
          }
    
          if (targetUser.id === interaction.guild.ownerId) {
            return interaction.editReply(
              "You can't kick the server owner."
            );
          }
    
          const targetUserRolePosition = targetUser.roles.highest.position;
          const requestUserRolePosition = interaction.member.roles.highest.position;
          const botRolePosition = interaction.guild.members.me.roles.highest.position;
    
          if (targetUserRolePosition >= requestUserRolePosition) {
            return interaction.editReply(
              "You can't kick that user because they have the same or a higher role than you."
            );
          }
    
          if (targetUserRolePosition >= botRolePosition) {
            return interaction.editReply(
              "I can't kick that user because they have the same or a higher role than me."
            );
          }
    
          // Kick the target user
          await targetUser.kick(reason);
          return interaction.editReply(
            `User ${targetUser.user.tag} has been kicked.\nReason: ${reason}`
          );
        } catch (error) {
          console.error(`Error kicking user: ${error}`);
          return interaction.editReply(
            'An error occurred while trying to kick the user.'
          );
        }
      },
    };
    