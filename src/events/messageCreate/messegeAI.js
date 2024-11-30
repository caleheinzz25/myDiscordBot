import { EmbedBuilder } from "discord.js"; // Using embed for a more attractive response

export const jancu = async ({ client, eventArg, db}) => {
    if (eventArg.author.bot) return;

    try {
        // Validate if AI is enabled for the channel
        const channelConfig = await db.mongoose.AIChannels.findOne({ channel_id: eventArg.channel.id });

        if (!channelConfig) {
            // return eventArg.channel.send("❌ AI is not enabled for this channel.");
            return
        }

        if (!channelConfig.ai_enabled){
            return eventArg.channel.send("Ai is not active now please activate it using /ai-channel-enable.");
        }

        // Starting a chat with Gemini or other AI service
        const chat = client.modelGemini.startChat({
            history: [
              {
                role: "user",
                parts: [
                    {
                        text: `${channelConfig.ai_description} and named u as ${channelConfig.ai_name}. While answering, don't describe any reaction.`
                    }
                ],
              },
              {
                role: "model",
                parts: [{ text: "Great to meet you. What would you like to know?" }],
              },
            ],
        });

        // Send message to the AI using the ChatGemini API or another service
        const result = await chat.sendMessage(eventArg.content, {
            aiName: channelConfig.ai_name,
            aiDescription: channelConfig.ai_description,
        });

        if (!result || !result.response) {
            return eventArg.channel.send("❌ There was an error receiving the response from the AI.");
        }

        // Format the response into an embed
        const embed = new EmbedBuilder()
            .setTitle(`💡 ${channelConfig.ai_name}`)
            .setDescription(result.response.text() + `\n\n- ask by ${eventArg.author.username}`)
            .setColor("#00FF99")
            .setTimestamp();

        return eventArg.channel.send({ embeds: [embed] });
    } catch (error) {
        console.error("Error in AI command:", error);
        return eventArg.channel.send("❌ An internal error occurred. Please try again later.");
    }
};
