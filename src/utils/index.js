import fs from 'fs/promises';
import path from 'path';


/**
 * @typedef {Object} dbObject
 * @property {string} [dbPath]
 * @property {string[]} [database]
 */

// /**
//  * @typedef {Object} devObj
//  * @property {string} [testServer]
//  * @property {string[]} [channels]
//  * @property {string[]} [devs]
//  * @property {string[]} [badWords]
//  */

/**
 * @typedef {Object} EventHandlerOptions
 * @property {Client} client
 * @property {string} [commandsPath]
 * @property {string} [eventsPath]
 * @property {dbObject} [db]
 * @property {string} [devServer]
 */

/**
 * Class to manage event handlers.
 */
class EventHandlers {
    /**
     * @param {EventHandlerOptions} options - The options for the event handler.
     */
    constructor(options = {}) {
        if (!options) {
            throw new Error("Options object is required to initialize the class.");
        }
    
        this.client = options.client || null;
        this.commandsPath = options.commandsPath || '';
        this.eventsPath = options.eventsPath || '';
        this.dbOptions = options.db || {};
        this.devServer = options.devServer || false;
        this.db = {};
    
        if (!this.commandsPath || !this.eventsPath) {
            console.error(
                `Initialization failed: Missing ${
                    !this.commandsPath ? 'commandsPath' : 'eventsPath'
                }`
            );
            return;
        }
    
        this.init().catch((error) =>
            console.error("Error during initialization:", error)
        );
    }

    /**
     * Initializes the event handlers.
     */
    async init() {
        try {
            if (this.dbOptions?.dbPath && this.dbOptions?.database) {
                const databaseModules = await this.getObjectModules(this.dbOptions.dbPath, true);
                this.initializeDatabases(databaseModules);
            }

            this.eventHandler(this.client);
        } catch (error) {
            console.error("Initialization failed:", error);
        }
    }

    /**
     * Initializes database connections.
     * @param {Object} databaseModules - Loaded database modules.
     */
    initializeDatabases(databaseModules) {
        for (const dbName of this.dbOptions.database) {
            if (databaseModules[dbName]) {
                this.db[dbName] = databaseModules[dbName];
                if (typeof this.db[dbName].connect === 'function') {
                    this.db[dbName].connect();
                } else {
                    console.warn(`Database module ${dbName} lacks a 'connect' method.`);
                }
            } else {
                console.warn(`Database ${dbName} not found in provided modules.`);
            }
        }
    }

    async eventHandler(client) {
        try {
            // Fetch all event files and their handlers
            const events = await this.getObjectModules(this.eventsPath);
            console.log('Starting event handler setup...');
            console.log('Available events:', Object.keys(events));
            
            // Iterate over each event and its corresponding handler files
            for (const [eventName, eventFiles] of Object.entries(events)) {
                // Skip events without handlers (unless it's a specific event like 'interactionCreate')
                if (!eventFiles || eventFiles.length === 0) {
                    if (eventName !== "interactionCreate") {
                        console.warn(`Skipping event '${eventName}' - no handlers available.`);
                        continue;
                    }
                }
    
                console.log(`\nProcessing event: ${eventName}`);
                console.log(`Number of handlers: ${eventFiles.length}`);
                // Use `once` for 'ready' event, and `on` for other events
                const isOnce = eventName === "ready";
                const eventMethod = isOnce ? client.once : client.on;
    
                console.log(`Setting up ${eventName} event with ${isOnce ? "'once'" : "'on'"} method...`);
    
                // Attach the event listener with the appropriate handler(s)
                eventMethod.call(client, eventName, async (eventArg) => {
                    try {
                        // Special handling for interactionCreate event
                        let commandObject = {};
                        if (eventName === "interactionCreate") {
                            commandObject = await this.handleCommands(client, eventArg, this.db);
                        } else if (eventName === "ready" || eventName === "guildCreate" ) {
                            // Special handling for the 'ready' and 'guildCreate' event
                            await this.registerCommands(client);
                        }

                        // Loop through event handlers and execute them
                        for (const eventFile of eventFiles) {
                            const funcName = Object.keys(eventFile)[0];
                            const handler = funcName === "default" ? eventFile.default : eventFile[funcName];
                            
                            if (handler) {
                                if (eventName === "interactionCreate") {
                                    // Pass commandObject if it is an interaction event
                                    if (await handler({ client, eventArg, command: commandObject, db: this.db })) break;
                                    
                                    // After handler, run the callback
                                    if (commandObject.callback) {
                                        await commandObject.callback({client, eventArg, command: commandObject, db:this.db});
                                    }
                                    continue;
                                }
    
                                if (this.db) {

                                    if (await handler({ client, eventArg, db: this.db })) break;
                                    continue;
                                }
    
                                if (await handler({ client, eventArg})) break;
                            }
                        }
    
                        // console.log(`Executed ${eventName} handler\n`);
                    } catch (error) {
                        console.error(`Error in ${eventName} handler :`, error);
                    }
                });
    
                console.log(`✓ Registered handler for ${eventName} (${isOnce ? "once" : "on"}).`);
            }
        } catch (error) {
            console.error("Event handler setup failed:", error);
        }
    }
    

    /**
     * Handles the execution of commands triggered by user interactions.
     * 
     * @param {Client} client - The Discord client instance.
     * @param {Object} interaction - The interaction object from Discord.
     * @param {Object} db - The database object to be used in command execution.
     * @returns {Object} - The command execution result 
     */
    async handleCommands(client, interaction, db) {
        if (!interaction.isChatInputCommand()) return;
    
        try {
            // Load and locate the command
            const localCommands = await this.getModules("src/commands");
            const commandsList = Object.values(localCommands).flat();
    
            // Find the command object matching the interaction
            const commandObject = commandsList.find(cmd => cmd.command.name === interaction.commandName);
            
            // Check if the commandObject exists before proceeding
            if (!commandObject) {
                console.error(`Command '${interaction.commandName}' not found.`);
                return;  // Early exit if commandObject is not found
            }
            
            // this.checkPermissions(interaction, commandObject)

            // Prepare database objects if required
            if (commandObject.db) {
                // Only collect db objects that are needed by the command
                db = commandObject.db.reduce((acc, dbName) => {
                    if (db[dbName]) acc[dbName] = db[dbName];
                    return acc;
                }, {});
            }
    
            console.log(`\nCommand '${commandObject.command.name}' executed successfully.`);
    
            // Return both command and callback
            return { command: commandObject.command, callback: commandObject.callback };
    
        } catch (error) {
            console.error(`Command execution error for '${interaction.commandName}':`, error);
    
            try {
                const replyMethod = interaction.replied || interaction.deferred ? 'editReply' : 'reply';
                await interaction[replyMethod]({
                    content: 'An error occurred while executing the command.',
                    ephemeral: true,
                });
            } catch (sendError) {
                console.error('Failed to send error message to the user:', sendError);
            }
        }
    }
    

    /**
     * Recursively retrieves files and folders from a directory.
     * 
     * @param {string} directory - The base directory to search.
     * @param {boolean} [foldersOnly=false] - Whether to return only folders.
     * @returns {Promise<{files: string[], folders: string[]}>} - An object containing arrays of file and folder paths.
     */
    async getFilesRecursively(directory, foldersOnly = false) {
        const fileNames = { files: [], folders: [] };

        const readDirectory = async (currentDir) => {
            try {
                const entries = await fs.readdir(currentDir, { withFileTypes: true });

                for (const entry of entries) {
                    const fullPath = path.resolve(currentDir, entry.name);

                    if (entry.isDirectory()) {
                        fileNames.folders.push(fullPath);
                        await readDirectory(fullPath); // Recurse into subdirectories
                    } else if (entry.isFile() && !foldersOnly) {
                        fileNames.files.push(fullPath);
                    }
                }
            } catch (error) {
                console.error(`Error reading directory '${currentDir}':`, error);
            }
        };

        await readDirectory(directory);
        return fileNames;
    }

    /**
     * Organizes files into groups based on their main folders.
     * 
     * @param {string} basePath - The base directory path to organize.
     * @returns {Promise<Array<{folder: string, files: string[]}>>} - An array of objects containing folder names and associated files.
     */
    async organizeFilesByMainFolders(basePath) {
        const { files, folders } = await this.getFilesRecursively(basePath);

        const folderMap = new Map();

        for (const folder of folders) {
            // Determine the main folder relative to the base path
            const mainFolder = path.relative(basePath, folder).split(path.sep)[0];

            if (!folderMap.has(mainFolder)) {
                folderMap.set(mainFolder, new Set());
            }

            const relativeFolderPath = path.relative(basePath, folder);

            // Find files matching the current folder
            const matchedFiles = files
                .map(file => path.relative(basePath, file))
                .filter(file => file.startsWith(relativeFolderPath));

            matchedFiles.forEach(file => folderMap.get(mainFolder).add(file));
        }

        // Convert Map to structured array
        return Array.from(folderMap.entries()).map(([folder, files]) => ({
            folder,
            files: Array.from(files),
        }));
    }

    /**
     * Dynamically imports modules from a specified directory, organized by main folders.
     *
     * @param {string} directory - Base directory for module search.
     * @param {boolean} [objectMode=false] - Whether to return modules as objects (keyed by their names).
     * @returns {Promise<Object>} - An object containing imported modules grouped by folder.
     */
    async getObjectModules(directory, objectMode = false) {
        const organizedFiles = await this.organizeFilesByMainFolders(directory);
        const modules = {};

        for (const folder of organizedFiles) {
            try {
                if (objectMode) {
                    // Return modules as objects (keyed by module name)
                    const folderModules = {};
                    for (const file of folder.files) {
                        const modulePath = path.resolve(directory, file);
                        try {
                            if (path.extname(modulePath) !== '.js') continue;

                            const module = await import(`file://${modulePath}`);
                            
                            const moduleName = Object.keys(module)[0];

                            if (!moduleName) continue;

                            if (moduleName === "default") {
                                console.error("\n❌ Error: Module name cannot be 'default'. Skipping.\n");
                                continue;
                            }

                            folderModules[moduleName] = module[moduleName];
                        } catch (error) {
                            console.error(`Failed to load module from: ${modulePath}`, error);
                        }
                    }
                    modules[folder.folder] = folderModules;
                } else {
                    // Return modules as arrays
                    const folderModules = [];
                    for (const file of folder.files) {
                        const modulePath = path.resolve(directory, file);
                        try {
                            if (path.extname(modulePath) !== '.js') continue;

                            const module = await import(`file://${modulePath}`);

                            if (Object.keys(module).length === 0) continue;
                            folderModules.push(module);
                        } catch (error) {
                            console.error(`Failed to load module from: ${modulePath}`, error);
                        }
                    }
                    modules[folder.folder] = folderModules;
                }
            } catch (error) {
                console.error(`Error processing folder "${folder.folder}":`, error);
            }
        }

        return modules;
    }

    /**
     * Flattens and extracts modules from an imported object structure.
     *
     * @param {string} basePath - Base directory path.
     * @param {string} [targetFolder=null] - Optional specific folder to target.
     * @returns {Promise<Array>} - Flattened array of modules.
     */
    async getModules(basePath) {
        const moduleObjects = await this.getObjectModules(basePath);

        return Object.values(moduleObjects)
            .flatMap(modules =>
                modules.map(module => {
                    const moduleKey = Object.keys(module)[0];
                    return module[moduleKey];
                })
            );
    }

    /**
     * Registers commands with the Discord application.
     * This will check for changes to the local commands and update them on Discord accordingly.
     *
     * @param {Client} client - The Discord client instance.
     */
    async registerCommands(client) {
        try {
            // Fetch local commands
            const localCommands = await this.getModules(this.commandsPath);

            if (this.devServer) {
                console.log("🔧 Dev mode is enabled. Syncing new commands only for the test server.");
            
                // Fetch the test server's name and ID
                const testServer = client.guilds.cache.get(this.devServer);
            
                if (!testServer) {
                    console.error(`❌ Test server with ID "${this.devServer}" not found in the bot's guild cache.`);
                    return;
                }
            
                console.log(`📋 Test server: ${testServer.name} (${testServer.id})`);
            
                // Fetch application commands for the test server
                const applicationCommands = await this.getApplicationCommands(client, this.devServer);
            
                for (const localCommand of localCommands) {
                    if (!localCommand) continue;
            
                    const { command, name, description, options, deleted } = localCommand;
                    const commandData = command || { name, description, options };
            
                    const existingCommand = applicationCommands.cache.find(cmd => cmd.name === commandData.name);
            
                    if (existingCommand) {
                        if (deleted) {
                            await applicationCommands.delete(existingCommand.id);
                            console.log(`🗑 Deleted command "${commandData.name}" in test server: ${testServer.name} (${testServer.id}).`);
                            continue;
                        }
            
                        if (this.areCommandsDifferent(existingCommand, commandData)) {
                            await applicationCommands.edit(existingCommand.id, commandData);
                            console.log(`🔁 Edited command "${commandData.name}" in test server: ${testServer.name} (${testServer.id}).`);
                        }
                    } else if (!deleted) {
                        await applicationCommands.create(commandData);
                        console.log(`👍 Registered command "${commandData.name}" in test server: ${testServer.name} (${testServer.id}).`);
                    }
                }
            }else {
                console.log("Syncing commands for all guilds where the bot is present.");

                // Loop through each guild where the bot is present
                for (const guild of client.guilds.cache.values()) {
                    console.log(`🔄 Syncing new commands for guild: ${guild.name} (${guild.id})`);

                    // Fetch existing application commands for the guild
                    const applicationCommands = await guild.commands.fetch();

                    for (const localCommand of localCommands) {
                        if (!localCommand) continue;

                        const { command, name, description, options, deleted } = localCommand;
                        const commandData = command || { name, description, options };

                        const existingCommand = applicationCommands.find(cmd => cmd.name === commandData.name);

                        if (existingCommand) {
                            if (deleted) {
                                await guild.commands.delete(existingCommand.id);
                                console.log(`🗑 Deleted command "${commandData.name}" in guild "${guild.name}".`);
                                continue;
                            }

                            if (this.areCommandsDifferent(existingCommand, commandData)) {
                                await guild.commands.edit(existingCommand.id, commandData);
                                console.log(`🔁 Edited command "${commandData.name}" in guild "${guild.name}".`);
                            }
                        } else if (!deleted) {
                            await guild.commands.create(commandData);
                            console.log(`👍 Registered command "${commandData.name}" in guild "${guild.name}".`);
                        }
                    }
                }
            }
        } catch (error) {
            console.error(`Commands sync error: ${error.message}`);
        }
    }


    /**
     * Compares two commands to see if they are different (in terms of description, options, or choices).
     *
     * @param {Object} existingCommand - The existing command from Discord.
     * @param {Object} localCommand - The local command to compare.
     * @returns {boolean} - Returns true if the commands are different.
     */
    areCommandsDifferent(existingCommand, localCommand) {
        const areChoicesDifferent = (existingChoices = [], localChoices = []) =>
            localChoices.some(localChoice => {
                const existingChoice = existingChoices.find(choice => choice.name === localChoice.name);
                return !existingChoice || localChoice.value !== existingChoice.value;
            });

        const areOptionsDifferent = (existingOptions = [], localOptions = []) =>
            localOptions.some(localOption => {
                const existingOption = existingOptions.find(option => option.name === localOption.name);
                return !existingOption ||
                    localOption.description !== existingOption.description ||
                    localOption.type !== existingOption.type ||
                    (localOption.required || false) !== existingOption.required ||
                    (localOption.choices?.length || 0) !== (existingOption.choices?.length || 0) ||
                    areChoicesDifferent(localOption.choices, existingOption.choices);
            });

        // Compare command description, options, and choices
        return existingCommand.description !== localCommand.description ||
            existingCommand.options?.length !== (localCommand.options?.length || 0) ||
            areOptionsDifferent(existingCommand.options, localCommand.options);
    }

    /**
     * Fetches the application commands from Discord, either globally or for a specific guild.
     *
     * @param {Client} client - The Discord client instance.
     * @param {string} guildId - The guild ID (optional for global commands).
     * @returns {Promise<Object>} - The collection of application commands.
     */
    async getApplicationCommands(client, guildId) {
        let applicationCommands;

        if (guildId) {
            // Fetch commands for a specific guild
            const guild = await client.guilds.fetch(guildId);
            applicationCommands = guild.commands;
        } else {
            // Fetch global commands
            applicationCommands = await client.application.commands;
        }

        await applicationCommands.fetch(); // Ensure the commands are up-to-date
        return applicationCommands;
    }

    /**
     * Menghapus properti dari objek berdasarkan nama properti yang ada dalam array.
     * 
     * @param {Object} obj - Objek yang akan difilter.
     * @param {Array<string>} keysToRemove - Array yang berisi nama-nama properti yang ingin dihapus dari objek.
     * @returns {Object} Objek baru yang hanya berisi properti yang tidak ada dalam array `keysToRemove`.
     */
    filterObject(obj, keysToRemove) {
        return Object.keys(obj)
        .filter(key => !keysToRemove.includes(key)) // Menyaring properti yang tidak ada dalam array
        .reduce((newObj, key) => {
            newObj[key] = obj[key]; // Menambahkan properti yang tersisa ke objek baru
            return newObj;
        }, {});
    }


    
    // /**
    //  * Checks if a user and bot meet the required permissions for a command.
    //  * 
    //  * @param {Object} interaction - The interaction object from Discord.
    //  * @param {Object} commandObject - The command object containing permission requirements.
    //  * @returns {Object} - An object indicating whether the check passed and an optional message.
    //  */
    // checkPermissions(interaction, commandObject) {
    //     const { member, guild } = interaction;

    //     // Dev-only check
    //     if (commandObject.devOnly && !this.devServer.devs.includes(member.id)) {
    //         return { allowed: false, message: 'Only developers are allowed to run this command.' };
    //     }

    //     // Test server check
    //     if (commandObject.testOnly && guild.id !== this.devServer.testServer) {
    //         return { allowed: false, message: 'This command cannot be run here.' };
    //     }

    //     // User permissions check
    //     if (commandObject.permissionsRequired?.length) {
    //         const missingPermission = commandObject.permissionsRequired.find(
    //             permission => !member.permissions.has(permission)
    //         );
    //         if (missingPermission) {
    //             return { allowed: false, message: `You lack the required permission: ${missingPermission}.` };
    //         }
    //     }

    //     // Bot permissions check
    //     if (commandObject.botPermissions?.length) {
    //         const bot = guild.members.me;
    //         const missingBotPermission = commandObject.botPermissions.find(
    //             permission => !bot.permissions.has(permission)
    //         );
    //         if (missingBotPermission) {
    //             return { allowed: false, message: `I am missing the required permission: ${missingBotPermission}.` };
    //         }
    //     }

    //     return { allowed: true };
    // }
}
export {
    EventHandlers
}