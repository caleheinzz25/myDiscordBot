
export default {
    command:{
        name: 'ping',
        description: 'Replies with the bot ping!'
    },
    devOnly: true,
    callback: async ({client, eventArg}) => {

        await eventArg.deferReply();

        const reply = await eventArg.fetchReply();
        const ping = reply.createdTimestamp - eventArg.createdTimestamp;

        eventArg.editReply(
        `Pong! Client ${ping}ms | Websocket: ${client.ws.ping}ms`
        );

        console.log(client.riffy)

        return
    },
};