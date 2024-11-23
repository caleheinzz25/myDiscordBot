import {
    ApplicationCommandOptionType,
    PermissionFlagsBits,
  } from 'discord.js';
  
  export default {
    name: 'kick-voice',
    description: 'Kicks and mutes a user from the voice channel for a specified duration.',
    options: [
      {
        name: 'target-user',
        description: 'The user you want to kick and mute from the voice channel.',
        type: ApplicationCommandOptionType.Mentionable,
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
        description: 'The reason for the kick and mute.',
        type: ApplicationCommandOptionType.String,
      },
    ],
    permissionsRequired: [PermissionFlagsBits.ModerateMembers],
    botPermissions: [PermissionFlagsBits.ModerateMembers],
  
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
          return interaction.editReply("You can't kick or mute the server owner.");
        }
  
        const targetUserRolePosition = targetUser.roles.highest.position;
        const requestUserRolePosition = interaction.member.roles.highest.position;
        const botRolePosition = interaction.guild.members.me.roles.highest.position;
  
        if (targetUserRolePosition >= requestUserRolePosition) {
          return interaction.editReply(
            "You can't kick or mute that user because they have the same or a higher role than you."
          );
        }
  
        if (targetUserRolePosition >= botRolePosition) {
          return interaction.editReply(
            "I can't kick or mute that user because they have the same or a higher role than me."
          );
        }
  
        // Make sure the target is in a voice channel
        const voiceChannel = targetUser.voice.channel;
        if (!voiceChannel) {
          return interaction.editReply('The target user is not in a voice channel.');
        }
  
        // Kick the user from the voice channel
        await targetUser.voice.kick(reason);
  
        // Mute the user in the voice channel for the specified duration
        await targetUser.voice.setMute(true, reason);
  
        interaction.editReply(
          `User ${targetUser.user.tag} has been kicked from the voice channel and muted for ${duration} minute(s).\nReason: ${reason}`
        );
  
        // Optionally unmute after the specified duration
        setTimeout(async () => {
          try {
            await targetUser.voice.setMute(false); // Unmute the user
          } catch (err) {
            console.error(`Failed to unmute ${targetUser.user.tag}:`, err);
          }
        }, duration * 60 * 1000); // Convert duration to milliseconds
  
      } catch (error) {
        console.error(`Error kicking or muting user: ${error}`);
        return interaction.editReply(
          'An error occurred while trying to kick or mute the user.'
        );
      }
    },
  };
  