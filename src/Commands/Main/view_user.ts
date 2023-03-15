import { userMention } from 'discord.js';
import Command from '../../Structures/Command.js';
import { SlashCommandBuilder } from 'discord.js';
import PartnerJson from '../../jsons/partners.json' assert { type: 'json' };

export default new Command({
    data: new SlashCommandBuilder()
        .setName('view_user')
        .setDescription('View information of a user')
        .addStringOption(input =>
            input.setName('username').setDescription('Username of the PikaNetwork player')
        )
        .addUserOption(input =>
            input.setName('user').setDescription('Discord user of the PikaNetwork player')
        ),
    run: async (client, interaction) => {
        const username = interaction.options.get('username')?.value as string;
        const user = interaction.options.getUser('user')?.id as string;
        if (username && user)
            return await interaction.reply({
                ephemeral: true,
                content: 'Please specify only one of the options.',
            });
        await interaction.deferReply();
        let userInfo;
        if (username) userInfo = await client.db.get(username);
        if (user) userInfo = (await client.db.all()).find(a => a.value.id === user)?.value;
        if (!username && !user)
            userInfo = (await client.db.all()).find(a => a.value.id === interaction.user.id)?.value;
        if (!userInfo) return await interaction.editReply('User has not linked their account.');
        const userRank =
            userInfo.rank === 'member'
                ? 'Member'
                : userInfo.rank === 'officer'
                ? 'Officer'
                : userInfo.rank === 'Leader'
                ? 'Leader'
                : userInfo.rank;
        const guildWithBadge =
              Object.values(PartnerJson.gpartners).includes(userInfo.guild)
                ? userInfo.guild + ' <a:PGPartneredGuild:1077203551039787048>'
                : userInfo.guild;
        const userWithBadge =
                Object.values(PartnerJson.spartners).includes(userInfo.username)
                  ? userInfo.username + ' <a:PGPartneredServerOwner:1077449569136300112>'
                  : userInfo.username;
        await interaction.editReply({
            content: `**USERNAME**: ${userWithBadge}\n**GUILD**: ${
                userInfo.guild === 'solo' ? 'Solo' : guildWithBadge
            }${userInfo.rank ? `\n**RANK**: ${userRank}` : ''}\n**USER**: ${userMention(
                userInfo.id
            )}`,
            allowedMentions: {
                parse: [],
            },
        });
    },
});

