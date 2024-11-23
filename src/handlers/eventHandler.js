import { getObjectModules } from '../utils/logger.js';
const events = await getObjectModules("src/events");
const eventHandler = (client) => {
    console.log('Starting event handler setup...');
    console.log('Available events:', Object.keys(events));

    for (const [eventName, eventFiles] of Object.entries(events)) {
        console.log(`\nProcessing event: ${eventName}`);
        console.log(`Number of handlers: ${eventFiles?.length}`);
        
        if (!eventFiles || eventFiles.length === 0) {
            console.log(`Skipping ${eventName} - no handlers`);
            continue;
        }

        // Check if the event name is valid
        if (!client.constructor.name === 'Client') {
            console.log('Client type:', client.constructor.name);
        }

        if (eventName === "ready") {
            console.log('Setting up ready event...');
            client.once(eventName, async (arg) => {
                for (const eventFile of eventFiles) {
                    try {
                        await eventFile.default(client, arg);
                        console.log(`Executed ready event handler`);
                    } catch (error) {
                        console.error(`Error in ready event handler: ${error}`);
                    }
                }
            });
        } else {
            console.log(`Setting up ${eventName} event...`);
            const correctEventName = eventName;
            
            client.on(correctEventName, async (arg) => {
                for (const eventFile of eventFiles) {
                    try {
                        await eventFile.default(client, arg);
                        console.log(`Executed ${correctEventName} event handler`);
                    } catch (error) {
                        console.error(`Error in ${correctEventName} event handler: ${error}`);
                    }
                }
            });
        }
        console.log(`✓ Registered event handler for ${eventName}`);
    }
};

export { eventHandler };