import {
    ApplicationCommandOptionType,
    PermissionFlagsBits,
    VoiceChannel,
  } from 'discord.js';
  import { joinVoiceChannel } from '@discordjs/voice';
  
  export default {
    name: 'join',
    description: 'Joins a voice channel and ensures the bot is not deafened.',
    options: [
      {
        name: 'channel',
        description: 'The voice channel you want the bot to join.',
        type: ApplicationCommandOptionType.Channel,
        required: true,
      },
    ],
    permissionsRequired: [PermissionFlagsBits.Connect],
    botPermissions: [PermissionFlagsBits.Connect, PermissionFlagsBits.Speak],
  
    callback: async (client, interaction) => {
      try {
        const channel = interaction.options.get('channel').channel;
  
        if (!channel || channel.type !== 2) { // Ensure the channel is a voice channel
          return interaction.reply({
            content: 'Please select a valid voice channel.',
            ephemeral: true,
          });
        }
  
        // Join the voice channel with selfDeaf set to false to avoid deafening
        const connection = joinVoiceChannel({
          channelId: channel.id,
          guildId: interaction.guild.id,
          adapterCreator: interaction.guild.voiceAdapterCreator,
          selfDeaf: false, // Ensure the bot is not deafened
        });
  
        await interaction.reply(
          `Joined the voice channel: ${channel.name}`
        );
  
        // Check if bot is already deafened and remove deafen if true
        const member = interaction.guild.members.me;
        if (member.voice.selfDeaf) {
          await member.voice.setDeaf(false); // Remove self-deaf status
          console.log('Removed self-deaf from bot.');
        }
  
        // Optional: Handle disconnection cleanup if necessary
        connection.on('stateChange', (oldState, newState) => {
          if (newState.status === 'disconnected') {
            console.log('Bot disconnected from the voice channel.');
          }
        });
      } catch (error) {
        console.error(`Error joining voice channel: ${error}`);
        return interaction.reply({
          content: 'An error occurred while trying to join the voice channel.',
          ephemeral: true,
        });
      }
    },
  };
  