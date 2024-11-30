const o = async ({eventArg, command}) => {
    // Check if the user has the required permissions
  const requiredPermissions = command.permissionsRequired || [];
  const userPermissions = eventArg.member.permissions;

  // Check if the user has the required permissions
  for (const permission of requiredPermissions) {
    if (!userPermissions.has(permission)) {
      return `❌ You do not have the required permissions to run this command. Missing: ${permission}`;
    }
  }

  // Check if the bot has the required permissions
  const botPermissions = command.botPermissions || [];
  const botMember = await eventArg.guild.members.fetch(eventArg.client.user.id);
  const botPermissionsInChannel = botMember.permissionsIn(eventArg.channel);

  // Check if the bot has the required permissions
  for (const permission of botPermissions) {
    if (!botPermissionsInChannel.has(permission)) {
      return `❌ The bot does not have the required permissions in this channel. Missing: ${permission}`;
    }
  }

  // If both checks pass, return null (no error)
  return null;
}

export {
    o
}