import {
    ApplicationCommandOptionType,
    PermissionFlagsBits,
  } from 'discord.js';
  
  export default {
    command: {
      name: 'timeout',
      description: 'Times out (mutes) a member from this server.',
      options: [
        {
          name: 'target-user',
          description: 'The user you want to timeout.',
          type: ApplicationCommandOptionType.Mentionable,
          required: true,
        },
        {
          name: 'duration',
          description: 'The duration of the timeout in minutes.',
          type: ApplicationCommandOptionType.Integer,
          required: true,
        },
        {
          name: 'reason',
          description: 'The reason for the timeout.',
          type: ApplicationCommandOptionType.String,
        },
      ]
    },
    permissionsRequired: [PermissionFlagsBits.ModerateMembers],
    botPermissions: [PermissionFlagsBits.ModerateMembers],
  
    callback: async ({client, eventArg}) => {
      try {
        const targetUserId = eventArg.options.get('target-user').value;
        const duration = eventArg.options.get('duration').value;
        const reason =
          eventArg.options.get('reason')?.value || 'No reason provided';
  
        await eventArg.deferReply();
  
        const targetUser = await eventArg.guild.members.fetch(targetUserId);
  
        if (!targetUser) {
          return eventArg.editReply("That user doesn't exist in this server.");
        }
  
        if (targetUser.id === eventArg.guild.ownerId) {
          return eventArg.editReply("You can't timeout the server owner.");
        }
  
        const targetUserRolePosition = targetUser.roles.highest.position;
        const requestUserRolePosition = eventArg.member.roles.highest.position;
        const botRolePosition = eventArg.guild.members.me.roles.highest.position;
  
        if (targetUserRolePosition >= requestUserRolePosition) {
          return eventArg.editReply(
            "You can't timeout that user because they have the same or a higher role than you."
          );
        }
  
        if (targetUserRolePosition >= botRolePosition) {
          return eventArg.editReply(
            "I can't timeout that user because they have the same or a higher role than me."
          );
        }
  
        // Set timeout duration (in milliseconds)
        const timeoutDuration = duration * 60 * 1000;
  
        // Apply timeout
        await targetUser.timeout(timeoutDuration, reason);
        eventArg.editReply(
          `User ${targetUser.user.tag} has been timed out for ${duration} minute(s).\nReason: ${reason}`
        );
  
        // Optionally remove the timeout after duration (Discord automatically handles this)
        setTimeout(async () => {
          try {
            await targetUser.timeout(null); // Remove timeout
          } catch (err) {
            console.error(`Failed to remove timeout for ${targetUser.user.tag}:`, err);
          }
        }, timeoutDuration);
      } catch (error) {
        console.error(`Error timing out user: ${error}`);
        return eventArg.editReply(
          'An error occurred while trying to timeout the user.'
        );
      }
    },
  };
  