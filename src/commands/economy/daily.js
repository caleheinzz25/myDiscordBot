import { Client, CommandInteraction } from 'discord.js';
import { getObjectModules } from '../../utils/logger.js';
const { mongoose: { userSchema } } = await getObjectModules("src/db", "mongoose", true);



const dailyAmount = 1000;

export default {
  name: 'daily',
  description: 'Collect your dailies!',
  /**
   *
   * @param {Client} client
   * @param {CommandInteraction} interaction
   */
    callback: async (client, interaction) => {
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
                userId: interaction.member.id,
                guildId: interaction.guild.id,
            };

            let user = await userSchema.findOne(query);

            if (user) {
                const lastDailyDate = user.lastDaily.toDateString();
                const currentDate = new Date().toDateString();

                if (lastDailyDate === currentDate) {
                interaction.editReply(
                    'You have already collected your dailies today. Come back tomorrow!'
                );
                return;
                }

                user.lastDaily = new Date();
            } else {
                user = new userSchema({
                ...query,
                lastDaily: new Date(),
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
