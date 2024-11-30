import {
    Client,
    ApplicationCommandOptionType,
    PermissionFlagsBits,
} from 'discord.js';

export default {
    devOnly: true,
    deleted: false,
    command:{
        name: 'ban',
        description: 'Bans a member from this server.',
        options: [
            {
            name: 'target-user',
            description: 'The user you want to ban.',
            type: ApplicationCommandOptionType.Mentionable,
            required: true,
            },
            {
            name: 'reason',
            description: 'The reason for the ban.',
            type: ApplicationCommandOptionType.String,
            },
        ]
    },
    permissionsRequired: [PermissionFlagsBits.BanMembers],
    botPermissions: [PermissionFlagsBits.BanMembers],

    /**
     * 
     * @param {Client} client 
     * @param {*} interaction 
     * @returns 
     */

    callback: async ({client, eventArg}) => {

        try {
            const targetUserId = eventArg.options.get('target-user').value;
            const reason =
                eventArg.options.get('reason')?.value || 'No reason provided';

            await eventArg.deferReply();

            const targetUser = await eventArg.guild.members.fetch(targetUserId);

            if (!targetUser) {
                return eventArg.editReply("That user doesn't exist in this server.");
            }

            if (targetUser.id === eventArg.guild.ownerId) {
                return eventArg.editReply(
                "You can't ban the server owner."
                );
            }

            const targetUserRolePosition = targetUser.roles.highest.position;
            const requestUserRolePosition = eventArg.member.roles.highest.position;
            const botRolePosition = eventArg.guild.members.me.roles.highest.position;

            if (targetUserRolePosition >= requestUserRolePosition) {
                return eventArg.editReply(
                "You can't ban that user because they have the same or a higher role than you."
                );
            }

            if (targetUserRolePosition >= botRolePosition) {
                return eventArg.editReply(
                "I can't ban that user because they have the same or a higher role than me."
                );
            }

            await targetUser.ban({ reason });
            return eventArg.editReply(
                `User ${targetUser.user.tag} has been banned.\nReason: ${reason}`
            );
        } catch (error) {
            console.error(`Error banning user: ${error}`);
            return eventArg.editReply(
                'An error occurred while trying to ban the user.'
            );
        }
    },
};
