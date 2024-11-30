const processedeventArgs = new Set(); // Keeps track of processed eventArgs to avoid repeated messages

export default async ({client, eventArg}) => {
  // Check if the guild object exists and has channels
  if (!eventArg.guild || !eventArg.guild.channels) return;

  // If the eventArg has already been processed (to prevent repeated messages), return early
  if (processedeventArgs.has(eventArg.id)) {
    console.log(`eventArg ${eventArg.id} already processed. No action taken.`);
    return;
  }

  // Add the eventArg to the processed set to mark them as processed
  processedeventArgs.add(eventArg.id);

  // Find the channel named 'general' (or modify as needed)
  const channel = eventArg.guild.channels.cache.find(
    (ch) => ch.name === 'general' // Replace 'general' with your desired channel name
  );

  if (channel) {
    // Create a beautiful embed message
    const embed = {
      color: 0x00ff00, // Green color for the embed
      title: `🎉 **A New Friend Has Arrived!** 🎉`,
      description: `Hey <@${eventArg.id}>! Welcome to **${eventArg.guild.name}**! 🌟\n\nWe're so excited to have you with us! 🙌`,
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
