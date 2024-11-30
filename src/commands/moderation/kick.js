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
    
      callback: async ({client, eventArg}) => {
        try {
          const targetUserId = eventArg.options.get('target-user').value;
          const reason =
            eventArg.options.get('reason')?.value || 'No reason provided';
    
          await eventArg.deferReply();
    
          const targetUser = await eventArg.guild.members.fetch(targetUserId);
    
          if (!targetUser) {
            return eventArg.editReply("That user doesn't exist in this server.");
          }
    
          if (targetUser.id === eventArg.guild.ownerId) {
            return eventArg.editReply(
              "You can't kick the server owner."
            );
          }
    
          const targetUserRolePosition = targetUser.roles.highest.position;
          const requestUserRolePosition = eventArg.member.roles.highest.position;
          const botRolePosition = eventArg.guild.members.me.roles.highest.position;
    
          if (targetUserRolePosition >= requestUserRolePosition) {
            return eventArg.editReply(
              "You can't kick that user because they have the same or a higher role than you."
            );
          }
    
          if (targetUserRolePosition >= botRolePosition) {
            return eventArg.editReply(
              "I can't kick that user because they have the same or a higher role than me."
            );
          }
    
          // Kick the target user
          await targetUser.kick(reason);
          return eventArg.editReply(
            `User ${targetUser.user.tag} has been kicked.\nReason: ${reason}`
          );
        } catch (error) {
          console.error(`Error kicking user: ${error}`);
          return eventArg.editReply(
            'An error occurred while trying to kick the user.'
          );
        }
      },
    };
    