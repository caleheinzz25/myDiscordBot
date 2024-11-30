import { EmbedBuilder, ApplicationCommandOptionType, PermissionFlagsBits } from "discord.js"; // Using embed for a more attractive response

export default {
  /**
   * Callback function for the slash command
   * @param {Client} client 
   * @param {CommandInteraction} eventArg 
   * @param {Object} db - MongoDB connection
   */
  callback: async ({ client, eventArg, db : { mongoose } }) => {
    const targetChannelId = eventArg.options.get('channel')?.value;

    try {
      // Fetch the channel configuration from the database
      const channelConfig = await mongoose.AIChannels.findOne({ channel_id: targetChannelId });

      if (!channelConfig) {
        return eventArg.reply("❌ No AI configuration found for this channel.");
      }

      if (!channelConfig.ai_enabled){
        return eventArg.reply("�� AI is already disabled for this channel.");
      }

      // Check if the channel matches the AI channel configured for the guild
      if (channelConfig.guild_id !== eventArg.guild.id) {
        return eventArg.reply("❌ This channel is not configured as an AI channel for this server.");
      }

      // Disable the AI for this channel directly (no need for options)
      channelConfig.ai_enabled = false;
      await channelConfig.save();

      // Send a confirmation message
      return eventArg.reply(`✅ AI has been disabled for <#${targetChannelId}>.`);
    } catch (error) {
      console.error("Error in AI command:", error);
      return eventArg.reply("❌ An internal error occurred. Please try again later.");
    }
  },
  db: [
    "mongoose"
  ],
  command: {
    name: 'ai-channel-disable',
    description: 'Disable the AI for a specific channel.',
    options: [
      {
        name: 'channel',
        description: 'The channel to disable AI in.',
        type: ApplicationCommandOptionType.Channel,
        required: true,
      }
    ],
  },
  permissionsRequired: [PermissionFlagsBits.Administrator],
  botPermissions: [PermissionFlagsBits.ManageChannels],
};
