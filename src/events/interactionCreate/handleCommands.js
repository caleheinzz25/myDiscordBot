import { config, getModules } from '../../utils/logger.js';
import { PermissionFlagsBits } from 'discord.js';


const checkPermissions = (interaction, commandObject) => {
  // Dev-only check
  if (commandObject.devOnly && !config.devs.includes(interaction.member.id)) {
    return { allowed: false, message: 'Only developers are allowed to run this command.' };
  }

  // Test server check
  if (commandObject.testOnly && interaction.guild.id !== config.testServer) {
    return { allowed: false, message: 'This command cannot be run here.' };
  }

  // User permissions check
  if (commandObject.permissionsRequired?.length) {
    const missingPermission = commandObject.permissionsRequired.find(
      permission => !interaction.member.permissions.has(permission)
    );
    if (missingPermission) {
      return { allowed: false, message: 'Not enough permissions.' };
    }
  }

  // Bot permissions check
  if (commandObject.botPermissions?.length) {
    const bot = interaction.guild.members.me;
    const missingBotPermission = commandObject.botPermissions.find(
      permission => !bot.permissions.has(permission)
    );
    if (missingBotPermission) {
      return { allowed: false, message: "I don't have enough permissions." };
    }
  }

  return { allowed: true };
};

export default async (client, interaction, distube) => {
  if (!interaction.isChatInputCommand) return;

  try {
    const localCommands = await getModules("src", "commands");
    const commandsList = Object.values(localCommands).flat();
    const commandObject = commandsList.find(cmd => cmd.name === interaction.commandName);

    if (!commandObject) return;

    const permissionCheck = checkPermissions(interaction, commandObject);
    if (!permissionCheck.allowed) {
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: permissionCheck.message,
          ephemeral: true
        });
      } else {
        await interaction.editReply({
          content: permissionCheck.message,
          ephemeral: true
        });
      }
      return;
    }

    await commandObject.callback(client, interaction);
  } catch (error) {
    console.error(`Command execution error: ${error}`);
    try {
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: 'An error occurred while executing the command.',
          ephemeral: true
        });
      } else {
        await interaction.editReply({
          content: 'An error occurred while executing the command.',
          ephemeral: true
        });
      }
    } catch {
      console.error('Failed to send error message');
    }
  }
};