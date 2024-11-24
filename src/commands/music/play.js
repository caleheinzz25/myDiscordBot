import {
    ApplicationCommandOptionType,
    PermissionFlagsBits,
  } from 'discord.js';
  import { joinVoiceChannel } from '@discordjs/voice';
  
  
  export default {
    name: 'play',
    description: 'Joins a voice channel and plays music.',
    options: [
      {
        name: 'song',
        description: 'The song to play (YouTube URL or search term).',
        type: ApplicationCommandOptionType.String,
        required: true,
      },
    ],
    permissionsRequired: [PermissionFlagsBits.Connect, PermissionFlagsBits.Speak],
    botPermissions: [PermissionFlagsBits.Connect, PermissionFlagsBits.Speak],
  
    callback: async (client, interaction) => {
      try {
        const song = interaction.options.get('song').value;
  
        // Check if the user is in a voice channel
        const voiceChannel = interaction.member.voice.channel;
        if (!voiceChannel) {
          return interaction.reply('You need to join a voice channel first!');
        }
  
        // Join the voice channel
        const connection = joinVoiceChannel({
          channelId: voiceChannel.id,
          guildId: interaction.guild.id,
          adapterCreator: interaction.guild.voiceAdapterCreator,
          selfDeaf: false, // Ensure the bot is not deafened
        });
  
        await interaction.reply(
          `Joined the voice channel **${voiceChannel.name}** and will now play: **${song}**`
        );
  
        // Use Distube to play the requested song
        distube.play(voiceChannel, song, {
          textChannel: interaction.channel,
          member: interaction.member,
        });
      } catch (error) {
        console.error(`Error playing music: ${error}`);
        return interaction.reply(
          'An error occurred while trying to play the music.'
        );
      }
    },
  };
  