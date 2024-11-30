import { ApplicationCommandOptionType, Client, CommandInteraction, PermissionFlagsBits } from 'discord.js';

export default {
  /**
   * 
   * @param {Client} client 
   * @param {CommandInteraction} eventArg 
   * @param {} db 
   */
  callback: async ({ client, eventArg, db: { mongoose } }) => {
    if (!eventArg.inGuild()) {
      eventArg.reply('❌ You can only run this command inside a server.');
      return;
    }

    const targetChannelId = eventArg.options.get('channel').value;
    const channelName = eventArg.options.get('ai_name')?.value || 'kaoru'; // Default name if not provided
    const description = eventArg.options.get('description')?.value || 'Default AI description';
    const enabled = eventArg.options.get('enabled')?.value ?? true; // Default to true

    try {
      await eventArg.deferReply();

      // Find the AI channel configuration for the guild
      let aiChannelConfig = await mongoose.AIChannels.findOne({ guild_id: eventArg.guild.id });

      if (!aiChannelConfig) {
        // If no configuration exists, create a new one
        aiChannelConfig = new mongoose.AIChannels({
          guild_id: eventArg.guild.id,
          channel_id: targetChannelId,
          ai_name: channelName,
          ai_description: description,
          ai_enabled: enabled,
        });

        await aiChannelConfig.save();
        eventArg.editReply(`✅ AI channel has been configured to <#${targetChannelId}> with name **${channelName}**.`);
        return;
      }

      // Update configuration if the channel ID is different
      if (aiChannelConfig.channel_id !== targetChannelId) {
        aiChannelConfig.channel_id = targetChannelId;
      }
      aiChannelConfig.channel_name = channelName;
      aiChannelConfig.description = description;
      aiChannelConfig.enabled = enabled;

      await aiChannelConfig.save();

      eventArg.editReply(`✅ AI channel has been updated to <#${targetChannelId}> with name **${channelName}**.`);
    } catch (error) {
      console.error('Error configuring AI channel:', error);
      eventArg.editReply('❌ There was an error configuring the AI channel. Please try again later.');
    }
  },
  db: [
    "mongoose"
  ],
  command: {
    name: 'ai-channel-configure',
    description: 'Configure the channel where the AI will operate.',
    options: [
      {
        name: 'channel',
        description: 'The channel you want the AI to operate in.',
        type: ApplicationCommandOptionType.Channel,
        required: true,
      },
      {
        name: 'ai_name',
        description: 'A custom name for the AI channel (optional).',
        type: ApplicationCommandOptionType.String,
        required: false,
      },
      {
        name: 'description',
        description: 'A description for the AI (optional).',
        type: ApplicationCommandOptionType.String,
        required: false,
      },
      {
        name: 'enabled',
        description: 'Enable or disable the AI (default: true).',
        type: ApplicationCommandOptionType.Boolean,
        required: false,
      },
    ],
  },
  permissionsRequired: [PermissionFlagsBits.Administrator],
  botPermissions: [PermissionFlagsBits.ManageChannels],
};
