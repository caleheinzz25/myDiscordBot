import { Client, CommandInteraction } from 'discord.js';




const dailyAmount = 1000;

export default {
    db: [
        "mongoose"
    ],
    command:{
        name: 'daily',
        description: 'Collect your dailies!'
    },
    /**
     *
     * @param {Client} client
     * @param {CommandInteraction} interaction
     */
    callback: async ({client, eventArg, db: { mongoose } }) => {
        if (!eventArg.inGuild()) {
            eventArg.reply({
                content: 'You can only run this command inside a server.',
                ephemeral: true,
            });
        return;
        }

        try {
            await eventArg.deferReply();

            const query = {
                user_id: eventArg.member.id,
                guild_id: eventArg.guild.id,
            };

            let user = await mongoose.userSchema.findOne(query);

            if (user) {
                const lastDailyDate = user.last_daily.toDateString();
                const currentDate = new Date().toDateString();

                if (lastDailyDate === currentDate) {
                eventArg.editReply(
                    'You have already collected your dailies today. Come back tomorrow!'
                );
                return;
                }

                user.last_daily = new Date();
            } else {
                user = new mongoose.userSchema({
                ...query,
                last_daily: new Date(),
                });
            }

            user.balance += dailyAmount;
            await user.save();

            eventArg.editReply(
                `${dailyAmount} was added to your balance. Your new balance is ${user.balance}`
            );
        } catch (error) {
            console.error(`Error with /daily: ${error}`);
        }
    },
};
