import { ApplicationCommandOptionType, Client, CommandInteraction, PermissionFlagsBits } from 'discord.js';
// import { MusicChannel } from '../../db/mongoose/schemas/volumeGuild'; // Import the MusicChannel schema

export default {
  /**
   *
   * @param {Client} client
   * @param {CommandInteraction} eventArg
   * @param {} db
   */
  callback: async ({ client, eventArg, db: { mongoose } }) => {
    if (!eventArg.inGuild()) {
        eventArg.reply('You can only run this command inside a server.');
        return;
    }

    const targetChannelId = eventArg.options.get('channel').value;

    try {
        await eventArg.deferReply();

        // Find the existing MusicChannel configuration based on guild_id
        let musicChannel = await mongoose.MusicChannel.findOne({ guild_id: eventArg.guild.id });

        // If no music channel configuration is found
        if (!musicChannel) {
            musicChannel = new mongoose.MusicChannel({
                guild_id: eventArg.guild.id,
                channel_id: targetChannelId,
                volume: 100, // You can set a default volume value
            });

            await musicChannel.save();
            eventArg.editReply(`Music channel has been configured to <#${targetChannelId}>.`);
            return;
        }

        // Fetch the channel from the guild
        const channel = await eventArg.guild.channels.fetch(musicChannel.channel_id);

        if (musicChannel.channel_id === targetChannelId) {
            eventArg.editReply(`Music is already configured to be played in <#${targetChannelId}>. To disable, run '/music-channel-disable'.`);
            return;
        }

        // Update the music channel configuration with the new channel
        musicChannel.channel_id = targetChannelId;
        await musicChannel.save();

        eventArg.editReply(`Music channel has now been updated to <#${targetChannelId}>. To disable, run '/music-channel-disable'.`);
    } catch (error) {
        console.error('Error configuring music channel:', error);
        eventArg.editReply('There was an error configuring the music channel. Please try again later.');
    }
  },
  db: [
    "mongoose"
  ],
  command: {
    name: 'music-channel-configure',
    description: 'Configure the channel where music will be played for this server.',
    options: [
      {
        name: 'channel',
        description: 'The channel you want the bot to play music in.',
        type: ApplicationCommandOptionType.Channel,
        required: true,
      },
    ]
  },
  permissionsRequired: [PermissionFlagsBits.Administrator],
  botPermissions: [PermissionFlagsBits.ManageChannels],
};
