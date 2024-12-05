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

    try {
      await eventArg.deferReply();

      // Find the existing MusicChannel configuration based on guild_id
      const musicChannel = await mongoose.MusicChannel.findOne({ guild_id: eventArg.guild.id });

      // If no music channel configuration is found
      if (!musicChannel) {
        eventArg.editReply('No music channel configuration found for this server.');
        return;
      }

      // Delete the music channel configuration
      await musicChannel.deleteOne();

      eventArg.editReply('Music channel has been disabled successfully.');
    } catch (error) {
      console.error('Error disabling music channel:', error);
      eventArg.editReply('There was an error disabling the music channel. Please try again later.');
    }
  },
  db: [
    "mongoose"
  ],
  command: {
    name: 'music-channel-disable',
    description: 'Disable the music channel for this server.',
  },
  permissionsRequired: [PermissionFlagsBits.Administrator],
  botPermissions: [PermissionFlagsBits.ManageChannels],
};
