import { SlashCommandBuilder } from "discord.js"

export default {
    // deleted: true,
    command: new SlashCommandBuilder()
    .setName('test')
    .setDescription('Replies with Pong!'),
    callback: (client, interaction) => {
        console.log("hey hey aku di cegat")
    },
}
