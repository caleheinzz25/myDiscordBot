import { 
    Client, 
    CommandInteraction, 
    ApplicationCommandOptionType, 
    AttachmentBuilder 
} from 'discord.js';
import { Font, RankCardBuilder } from 'canvacord';
import { calculateLevelXp, getObjectModules } from '../../utils/logger.js';
const { mongoose: { levelSchema } } = await getObjectModules("src/db", "mongoose", true);
Font.loadDefault();

export default {
    /**
     *
     * @param {Client} client
     * @param {Interaction} interaction
     */
    callback: async (client, interaction) => {
        if (!interaction.inGuild()) {
        interaction.reply('You can only run this command inside a server.');
        return;
        }

        await interaction.deferReply();

        const mentionedUserId = interaction.options.get('target-user')?.value;
        const targetUserId = mentionedUserId || interaction.member.id;
        const targetUserObj = await interaction.guild.members.fetch(targetUserId);

        const fetchedLevel = await levelSchema.findOne({
        user_id: targetUserId,
        guild_id: interaction.guild.id,
        });

        if (!fetchedLevel) {
        interaction.editReply(
            mentionedUserId
            ? `${targetUserObj.user.tag} doesn't have any levels yet. Try again when they chat a little more.`
            : "You don't have any levels yet. Chat a little more and try again."
        );
        return;
        }

        let allLevels = await levelSchema.find({ guild_id: interaction.guild.id }).select(
        '-_id user_id level xp'
        );

        allLevels.sort((a, b) => {
        if (a.level === b.level) {
            return b.xp - a.xp;
        } else {
            return b.level - a.level;
        }
        });

        let currentRank = allLevels.findIndex((lvl) => lvl.user_id === targetUserId) + 1;

        const rank = new RankCardBuilder()
            .setDisplayName(targetUserObj.user.username) // Nama besar
            .setUsername(`@${targetUserObj.user.discriminator}`) // Nama kecil
            .setAvatar(targetUserObj.user.displayAvatarURL({ size: 256 })) // Avatar pengguna
            .setCurrentXP(fetchedLevel.xp) // XP saat ini
            .setRequiredXP(calculateLevelXp(fetchedLevel.level)) // XP yang dibutuhkan
            .setLevel(fetchedLevel.level) // Level pengguna
            .setRank(currentRank) // Peringkat pengguna
            .setOverlay(90) // Overlay transparan, ubah sesuai keinginan
            .setBackground("#23272a") // Warna latar belakang, ubah jika menggunakan gambar
            //.setBackground("./path/to/image.png") // Gunakan jika ingin gambar sebagai latar belakang
            .setStatus(targetUserObj.presence.status); // Status pengguna
      
        
        // To build and get the card as a buffer
        const cardBuffer = await rank.build({
            format: 'png'
        });
        const attachment = new AttachmentBuilder(cardBuffer, { name: 'rank.png' });
        interaction.editReply({ files: [attachment], ephemeral: true });
    },

    name: 'level',
    description: "Shows your/someone's level.",
    options: [
        {
        name: 'target-user',
        description: 'The user whose level you want to see.',
        type: ApplicationCommandOptionType.Mentionable,
        },
    ],
    // deleted: true
};
