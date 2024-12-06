import {
  ApplicationCommandOptionType,
  Client,
  CommandInteraction,
  PermissionFlagsBits,
} from "discord.js";

export default {
  /**
   * @param {Client} client
   * @param {CommandInteraction} eventArg
   * @param {Object} db
   */
  callback: async ({ client, eventArg, db: { mongoose } }) => {
    if (!eventArg.inGuild()) {
      return eventArg.reply("❌ This command can only be used inside a server.");
    }

    // Extract options
    const targetChannelId = eventArg.options.get("channel").value;
    const channelName = eventArg.options.get("ai_name")?.value || "kaoru"; // Default name
    const description =
      eventArg.options.get("description")?.value || "Default AI description";
    const enabled = eventArg.options.get("enabled")?.value ?? true; // Default to true

    try {
      await eventArg.deferReply();

      // Fetch or initialize AI channel configuration and conversation history
      const [aiChannelConfig, aiConversation] = await Promise.all([
        mongoose.AIChannels.findOne({ guild_id: eventArg.guild.id }),
        mongoose.AIConversation.findOne({ guild_id: eventArg.guild.id }),
      ]);

      if (!aiChannelConfig) {
        // Create new AI channel configuration and conversation if none exists
        await mongoose.AIChannels.create({
          guild_id: eventArg.guild.id,
          channel_id: targetChannelId,
          ai_name: channelName,
          ai_description: description,
          ai_enabled: enabled,
        });

        await mongoose.AIConversation.create({
          guild_id: eventArg.guild.id,
          channel_id: targetChannelId,
        });

        return eventArg.editReply(
          `✅ AI channel has been configured to <#${targetChannelId}> with name **${channelName}**.`
        );
      }

      // Update existing configuration
      Object.assign(aiChannelConfig, {
        channel_id: targetChannelId,
        ai_name: channelName,
        ai_description: description,
        ai_enabled: enabled,
      });

      await aiChannelConfig.save();

      return eventArg.editReply(
        `✅ AI channel has been updated to <#${targetChannelId}> with name **${channelName}**.`
      );
    } catch (error) {
      console.error("Error configuring AI channel:", error);
      return eventArg.editReply(
        "❌ An error occurred while configuring the AI channel. Please try again later."
      );
    }
  },

  command: {
    name: "ai-channel-configure",
    description: "Configure the channel where the AI will operate.",
    options: [
      {
        name: "channel",
        description: "The channel where the AI will operate.",
        type: ApplicationCommandOptionType.Channel,
        required: true,
      },
      {
        name: "ai_name",
        description: "Custom name for the AI (optional).",
        type: ApplicationCommandOptionType.String,
        required: false,
      },
      {
        name: "description",
        description: "Custom description for the AI (optional).",
        type: ApplicationCommandOptionType.String,
        required: false,
      },
      {
        name: "enabled",
        description: "Enable or disable the AI (default: true).",
        type: ApplicationCommandOptionType.Boolean,
        required: false,
      },
    ],
  },

  permissionsRequired: [PermissionFlagsBits.Administrator],
  botPermissions: [PermissionFlagsBits.ManageChannels],
};
