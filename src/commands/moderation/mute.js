import {
  ApplicationCommandOptionType,
  PermissionFlagsBits,
} from 'discord.js';

export default {
  command:{
    name: 'mute',
    description: 'Mutes a member in voice channels.',
    options: [
      {
        name: 'target-user',
        description: 'The user you want to mute.',
        type: ApplicationCommandOptionType.User,
        required: true,
      },
      {
        name: 'duration',
        description: 'The duration of the mute in minutes.',
        type: ApplicationCommandOptionType.Integer,
        required: true,
      },
      {
        name: 'reason',
        description: 'The reason for the mute.',
        type: ApplicationCommandOptionType.String,
      },
    ]
  },
  permissionsRequired: [PermissionFlagsBits.MuteMembers],
  botPermissions: [PermissionFlagsBits.MuteMembers],

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
        return eventArg.editReply(
          "You can't mute the server owner."
        );
      }

      const targetUserRolePosition = targetUser.roles.highest.position;
      const requestUserRolePosition = eventArg.member.roles.highest.position;
      const botRolePosition = eventArg.guild.members.me.roles.highest.position;

      if (targetUserRolePosition >= requestUserRolePosition) {
        return eventArg.editReply(
          "You can't mute that user because they have the same or a higher role than you."
        );
      }

      if (targetUserRolePosition >= botRolePosition) {
        return eventArg.editReply(
          "I can't mute that user because they have the same or a higher role than me."
        );
      }

      // Check if the user is in a voice channel
      const voiceState = targetUser.voice;
      if (!voiceState.channel) {
        return eventArg.editReply('The user is not in a voice channel.');
      }

      // Mute the user
      await voiceState.setMute(true, reason);

      eventArg.editReply(
        `User ${targetUser.user.tag} has been muted in voice channels for ${duration} minute(s).\nReason: ${reason}`
      );

      // Automatically unmute after the specified duration
      setTimeout(async () => {
        try {
          await voiceState.setMute(false);
          console.log(`Unmuted ${targetUser.user.tag} after ${duration} minutes.`);
        } catch (error) {
          console.error(`Failed to unmute user: ${error}`);
        }
      }, duration * 60 * 1000);
    } catch (error) {
      console.error(`Error muting user: ${error}`);
      return eventArg.editReply(
        'An error occurred while trying to mute the user.'
      );
    }
  },
};
