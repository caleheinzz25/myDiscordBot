export default {
  command: {
      name: 'play',
      description: 'Play a track or playlist from YouTube.',
      options: [
          {
              name: 'query',
              description: 'The YouTube link or search query.',
              type: 3, // STRING
              required: true,
          },
      ],
  },
  devOnly: true,
  callback: async ({ client, interaction }) => {
      // Defer reply to allow processing time
      await interaction.deferReply();

      // Get the query option provided by the user
      const query = interaction.options.getString('query');
      const member = interaction.member;

      // Check if the user is in a voice channel
      if (!member.voice.channel) {
          await interaction.editReply('You must be in a voice channel to use this command.');
          return;
      }

      try {
          // Create a player connection
          const player = client.riffy.createConnection({
              guildId: interaction.guild.id,
              voiceChannel: member.voice.channel.id,
              textChannel: interaction.channel.id,
              deaf: true,
          });

          // Resolve the query using the riffy client
          const resolve = await client.riffy.resolve({
              query: query,
              requester: interaction.user,
          });

          const { loadType, tracks, playlistInfo } = resolve;

          // Process the resolved data based on load type
          if (loadType === "playlist") {
              for (const track of resolve.tracks) {
                  track.info.requester = interaction.user;
                  player.queue.add(track);
              }

              await interaction.editReply(
                  `Added \`${tracks.length}\` tracks from \`${playlistInfo.name}\`.`
              );

              if (!player.playing && !player.paused) player.play();
          } else if (loadType === "search" || loadType === "track") {
              const track = tracks.shift();
              track.info.requester = interaction.user;

              player.queue.add(track);
              await interaction.editReply(`Added: \`${track.info.title}\`.`);

              if (!player.playing && !player.paused) player.play();
          } else {
              await interaction.editReply('No results found for your query.');
          }
      } catch (error) {
          console.error('Error handling play command:', error);
          await interaction.editReply('An error occurred while processing your request.');
      }
  },
};
