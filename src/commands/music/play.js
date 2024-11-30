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
  callback: async ({ client, eventArg }) => {
      // Defer reply to allow processing time
      await eventArg.deferReply();

      // Get the query option provided by the user
      const query = eventArg.options.getString('query');
      const member = eventArg.member;

      // Check if the user is in a voice channel
      if (!member.voice.channel) {
          await eventArg.editReply('You must be in a voice channel to use this command.');
          return;
      }

      try {
          // Create a player connection
          const player = client.riffy.createConnection({
              guildId: eventArg.guild.id,
              voiceChannel: member.voice.channel.id,
              textChannel: eventArg.channel.id,
              deaf: true,
          });

          // Resolve the query using the riffy client
          const resolve = await client.riffy.resolve({
              query: query,
              requester: eventArg.user,
          });

          const { loadType, tracks, playlistInfo } = resolve;

          // Process the resolved data based on load type
          if (loadType === "playlist") {
              for (const track of resolve.tracks) {
                  track.info.requester = eventArg.user;
                  player.queue.add(track);
              }

              await eventArg.editReply(
                  `Added \`${tracks.length}\` tracks from \`${playlistInfo.name}\`.`
              );

              if (!player.playing && !player.paused) player.play();
          } else if (loadType === "search" || loadType === "track") {
              const track = tracks.shift();
              track.info.requester = eventArg.user;

              player.queue.add(track);
              await eventArg.editReply(`Added: \`${track.info.title}\`.`);

              if (!player.playing && !player.paused) player.play();
          } else {
              await eventArg.editReply('No results found for your query.');
          }
      } catch (error) {
          console.error('Error handling play command:', error);
          await eventArg.editReply('An error occurred while processing your request.');
      }
  },
};
