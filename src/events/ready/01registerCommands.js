import { config, getModules, getApplicationCommands, areCommandsDifferent } from '../../utils/logger.js';

export default async (client) => {
  try {
    const localCommands = await getModules("src", "commands");
    const applicationCommands = await getApplicationCommands(client, config.testServer);

    for (const localCommand of localCommands) {
      const { name, description, options, deleted } = localCommand;
      const existingCommand = applicationCommands.cache.find(cmd => cmd.name === name);

      if (existingCommand) {
        if (deleted) {
          await applicationCommands.delete(existingCommand.id);
          console.log(`🗑 Deleted command "${name}".`);
          continue;
        }

        if (areCommandsDifferent(existingCommand, localCommand)) {
          await applicationCommands.edit(existingCommand.id, { description, options });
          console.log(`🔁 Edited command "${name}".`);
        }
      } else if (!deleted) {
        await applicationCommands.create({ name, description, options });
        console.log(`👍 Registered command "${name}".`);
      }
    }
  } catch (error) {
    console.error(`Commands sync error: ${error}`);
  }
};