import {
  ApplicationCommandOptionType,
  PermissionFlagsBits,
} from 'discord.js';

export default {
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
  ],
  permissionsRequired: [PermissionFlagsBits.MuteMembers],
  botPermissions: [PermissionFlagsBits.MuteMembers],

  callback: async (client, interaction) => {
    try {
      const targetUserId = interaction.options.get('target-user').value;
      const duration = interaction.options.get('duration').value;
      const reason =
        interaction.options.get('reason')?.value || 'No reason provided';

      await interaction.deferReply();

      const targetUser = await interaction.guild.members.fetch(targetUserId);

      if (!targetUser) {
        return interaction.editReply("That user doesn't exist in this server.");
      }

      if (targetUser.id === interaction.guild.ownerId) {
        return interaction.editReply(
          "You can't mute the server owner."
        );
      }

      const targetUserRolePosition = targetUser.roles.highest.position;
      const requestUserRolePosition = interaction.member.roles.highest.position;
      const botRolePosition = interaction.guild.members.me.roles.highest.position;

      if (targetUserRolePosition >= requestUserRolePosition) {
        return interaction.editReply(
          "You can't mute that user because they have the same or a higher role than you."
        );
      }

      if (targetUserRolePosition >= botRolePosition) {
        return interaction.editReply(
          "I can't mute that user because they have the same or a higher role than me."
        );
      }

      // Check if the user is in a voice channel
      const voiceState = targetUser.voice;
      if (!voiceState.channel) {
        return interaction.editReply('The user is not in a voice channel.');
      }

      // Mute the user
      await voiceState.setMute(true, reason);

      interaction.editReply(
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
      return interaction.editReply(
        'An error occurred while trying to mute the user.'
      );
    }
  },
};
