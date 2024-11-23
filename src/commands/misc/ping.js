export default {
    name: 'ping',
    description: 'Replies with the bot ping!',
    devOnly: true,
    callback: async (client, interaction) => {
        await interaction.deferReply();

        const reply = await interaction.fetchReply();

        const ping = reply.createdTimestamp - interaction.createdTimestamp;
        

        console.log(`command ping executed`)
        interaction.editReply(
        `Pong! Client ${ping}ms | Websocket: ${client.ws.ping}ms`
        );

        return
    },
};