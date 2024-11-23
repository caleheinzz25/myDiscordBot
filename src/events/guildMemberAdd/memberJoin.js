const processedMembers = new Set(); // Keeps track of processed members to avoid repeated messages

export default async (client, member) => {
  // Check if the guild object exists and has channels
  if (!member.guild || !member.guild.channels) return;

  // If the member has already been processed (to prevent repeated messages), return early
  if (processedMembers.has(member.id)) {
    console.log(`Member ${member.id} already processed. No action taken.`);
    return;
  }

  // Add the member to the processed set to mark them as processed
  processedMembers.add(member.id);

  // Find the channel named 'general' (or modify as needed)
  const channel = member.guild.channels.cache.find(
    (ch) => ch.name === 'general' // Replace 'general' with your desired channel name
  );

  if (channel) {
    // Create a beautiful embed message
    const embed = {
      color: 0x00ff00, // Green color for the embed
      title: `🎉 **A New Friend Has Arrived!** 🎉`,
      description: `Hey <@${member.id}>! Welcome to **${member.guild.name}**! 🌟\n\nWe're so excited to have you with us! 🙌`,
      fields: [
        {
          name: "🚀 **What to do next?**",
          value: "1. Head over to the **#introductions** channel and say hi! 👋\n2. Read our **#rules** to make sure you're up to date.\n3. Explore our community and enjoy chatting with everyone! 💬",
        },
        {
          name: "Need help?",
          value: "Feel free to ask in **#help** or ping a moderator! 😄",
        },
      ],
      footer: {
        text: "Once again, welcome, and enjoy your time here! 🎈",
      },
      timestamp: new Date(),
    };

    // Send the embed message
    channel.send({ embeds: [embed] });
  } else {
    console.log('No channel found with the name "general"');
  }
};
