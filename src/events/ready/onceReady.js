// import { config } from "../../utils/logger.js";
// import fs from "fs";
export default async ({ client }) => {
    client.riffy.init(client.user.id);
    console.log(`Logged in as ${client.user.tag}`);

//     try {
//         // Get all guilds the bot is in
//         const guild = client.guilds.cache.get(config.testServer); // Replace with your guild ID
//         if (!guild) {
//           console.error('Guild not found');
//           return;
//         }
    
//         // Fetch all members of the guild
//         await guild.members.fetch();
    
//         // Extract member IDs
//         const memberIds = guild.members.cache.map(member => member.id);
    
//         // Save member IDs to a JSON file
//         fs.writeFileSync('src/config/membersId.json', JSON.stringify(memberIds, null, 2));
    
//         console.log('Member IDs saved to members.json');
//       } catch (error) {
//         console.error('Error fetching members:', error);
//       }
}