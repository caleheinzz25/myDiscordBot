import { Client, CommandInteraction, PermissionFlagsBits } from 'discord.js';


export default {
  /**
   *
   * @param {Client} client
   * @param {CommandInteraction} interaction
   */
  callback: async ({client, eventArg, db: { mongoose }}) => {
    try {
      await eventArg.deferReply();

      if (!(await mongoose.autoRoleSchema.exists({ guild_id: eventArg.guild.id }))) {
        eventArg.editReply('Auto role has not been configured for this server. Use `/autorole-configure` to set it up.');
        return;
      }
      
      await mongoose.autoRoleSchema.findOneAndDelete({ guild_id: eventArg.guild.id });
      eventArg.editReply("'Auto role has been disabled for this server. Use `/autorole-configure` to set it up again.'");
    } catch (error) {
      console.log(error);
    }
  },
  db: [
    "mongoose"
  ],
  command:{
    name: 'autorole-disable',
    description: 'Disable auto-role in this server.',
    permissionsRequired: [PermissionFlagsBits.Administrator]
  },
};
