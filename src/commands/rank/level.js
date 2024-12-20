import { 
    Client, 
    CommandInteraction, 
    ApplicationCommandOptionType, 
    AttachmentBuilder 
} from 'discord.js';
import { Font, RankCardBuilder } from 'canvacord';
import { calculateLevelXp } from '../../utils/logger.js';
Font.loadDefault();

export default {
    /**
     *
     * @param {Client} client
     * @param {Interaction} interaction
     */
    callback: async ({client, eventArg, db: { mongoose }}) => {
        if (!eventArg.inGuild()) {
        eventArg.reply('You can only run this command inside a server.');
        return;
        }

        await eventArg.deferReply();

        const mentionedUserId = eventArg.options.get('target-user')?.value;
        const targetUserId = mentionedUserId || eventArg.member.id;
        const targetUserObj = await eventArg.guild.members.fetch(targetUserId);

        const fetchedLevel = await mongoose.levelSchema.findOne({
        user_id: targetUserId,
        guild_id: eventArg.guild.id,
        });

        if (!fetchedLevel) {
        eventArg.editReply(
            mentionedUserId
            ? `${targetUserObj.user.tag} doesn't have any levels yet. Try again when they chat a little more.`
            : "You don't have any levels yet. Chat a little more and try again."
        );
        return;
        }

        let allLevels = await mongoose.levelSchema.find({ guild_id: eventArg.guild.id }).select(
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
        eventArg.editReply({ files: [attachment], ephemeral: true });
    },
    db: [
        "mongoose"
    ],
    command: {
        name: 'level',
        description: "Shows your/someone's level.",
        options: [
            {
            name: 'target-user',
            description: 'The user whose level you want to see.',
            type: ApplicationCommandOptionType.Mentionable,
            },
        ],
    }
    // deleted: true
};
