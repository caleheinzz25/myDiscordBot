import { EmbedBuilder } from "discord.js";

export const jancu = async ({ client, eventArg, db }) => {
    if (eventArg.author.bot) return; // Ignore bot messages

    try {
        // Ensure guild_id is present
        const guildId = eventArg.guildId;
        if (!guildId) {
            return eventArg.channel.send("❌ Guild ID is required for this command.");
        }

        console.log(guildId)

        // Fetch channel configuration and conversation history from the database
        const [channelConfig, AIConversation] = await Promise.all([
            db.mongoose.AIChannels.findOne({ channel_id: eventArg.channel.id, guild_id: guildId }),
            db.mongoose.AIConversation.findOne({ channel_id: eventArg.channel.id, guild_id: guildId }),
        ]);

        if (!channelConfig) return; // If the channel is not configured, silently exit

        if (!channelConfig.ai_enabled) {
            return eventArg.channel.send("❌ AI is not active. Use `/ai-channel-enable` to activate.");
        }

        // Start chat with Gemini AI
        const chat = client.modelGemini.startChat({
            history: [
                {
                    role: "user",
                    parts: [
                        {
                            text: `${channelConfig.ai_description} and named you ${channelConfig.ai_name}. Avoid describing reactions.`,
                        },
                    ],
                },
                {
                    role: "model",
                    parts: [{ text: "Great to meet you. What would you like to know?" }],
                },
                ...(AIConversation?.conversation || []),
            ],
        });

        // Send user input to AI and get the response
        const result = await chat.sendMessage(eventArg.content, {
            aiName: channelConfig.ai_name,
            aiDescription: channelConfig.ai_description,
        });

        if (!result || !result.response) {
            return eventArg.channel.send("❌ Error receiving response from the AI.");
        }

        const aiResponse = result.response.text();

        // Update the conversation in the database
        if (AIConversation) {
            AIConversation.conversation.push(
                { role: "user", parts: [{ text: eventArg.content }] },
                { role: "model", parts: [{ text: aiResponse }] }
            );
            await AIConversation.save();
        } else {
            await db.mongoose.AIConversation.create({
                channel_id: eventArg.channel.id,
                guild_id: guildId, // Ensure guild_id is saved
                conversation: [
                    { role: "user", parts: [{ text: eventArg.content }] },
                    { role: "model", parts: [{ text: aiResponse }] },
                ],
            });
        }

        // Create and send an embed message
        const embed = new EmbedBuilder()
            .setTitle(`💡 ${channelConfig.ai_name}`)
            .setDescription(`${aiResponse}\n\n- Asked by **${eventArg.author.username}**`)
            .setColor("#00FF99")
            .setTimestamp();

        return eventArg.channel.send({ embeds: [embed] });
    } catch (error) {
        console.error("Error in AI command:", error);
        return eventArg.channel.send("❌ An internal error occurred. Please try again later.");
    }
};
