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
    callback: async ({client, interaction, db: { mongoose } }) => {
        if (!interaction.inGuild()) {
            interaction.reply({
                content: 'You can only run this command inside a server.',
                ephemeral: true,
            });
        return;
        }

        try {
            await interaction.deferReply();

            const query = {
                user_id: interaction.member.id,
                guild_id: interaction.guild.id,
            };

            let user = await mongoose.userSchema.findOne(query);

            if (user) {
                const lastDailyDate = user.last_daily.toDateString();
                const currentDate = new Date().toDateString();

                if (lastDailyDate === currentDate) {
                interaction.editReply(
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

            interaction.editReply(
                `${dailyAmount} was added to your balance. Your new balance is ${user.balance}`
            );
        } catch (error) {
            console.error(`Error with /daily: ${error}`);
        }
    },
};
