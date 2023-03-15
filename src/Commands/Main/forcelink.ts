/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';
import { DatabaseObjectLinked } from '../../Interfaces/LastObjectLinkAccount';
import Command from '../../Structures/Command.js';
import {
    ActionRowBuilder,
    ComponentType,
    EmbedBuilder,
    PermissionFlagsBits,
    Role,
    SelectMenuOptionBuilder,
    SlashCommandBuilder,
    StringSelectMenuBuilder,
    TextChannel,
} from 'discord.js';
import { PikaUserStatsResponse } from '../../Interfaces/PikaAPIResponse';

export default new Command({
    data: new SlashCommandBuilder()
        .setName('force_link')
        .setDescription('Force a link (Administrator+)')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(input =>
            input
                .setName('username')
                .setDescription('Username of the user to link')
                .setRequired(true)
        )
        .addUserOption(input =>
            input.setName('user').setDescription('User to force link').setRequired(true)
        ),
    run: async (client, interaction) => {
        const roleIds = {
            leader: '1045778530199416874',
            officer: '1045778525849919548',
            member: '1045778533273837679',
            Solo: '1045776517214515292',
            linked: '1072183092795674634',
        };
        if (!interaction.inGuild()) return;
        const username = interaction.options.get('username')?.value as string;
        if (await client.db.has(username))
            return await interaction.reply({
                ephemeral: true,
                content: 'This user has already linked their account.',
            });
        if (!/^[a-zA-Z0-9_]{2,16}$/gm.test(username))
            return await interaction.reply({
                ephemeral: true,
                content: 'The username provided is invalid!',
            });
        await interaction.deferReply({
            ephemeral: true,
        });
        const member = interaction.guild?.members.cache.find(
            a => a.id === interaction.options.getUser('user')?.id
        );
        if (!member) return await interaction.editReply('That member was not found');
        const isThereAUser = await client.db.has(username);
        if (isThereAUser)
            return await interaction.editReply(
                'Someone has already linked with that. Use /force_unlink to unlink it.'
            );
        try {
            const response = await axios.get(
                `https://stats.pika-network.net/api/profile/${username}`
            );
            const data: PikaUserStatsResponse = response.data;
            const guild = data.clan;

            const guildName = guild?.name || 'Solo';
            const roles = await interaction.guild?.roles.fetch();
            let role = roles?.get(roleIds.Solo) as Role;
            if (guildName === 'Solo') {
                member.roles.add(roleIds.linked);
                const databaseUser = (await client.db.set(username, {
                    id: member.id,
                    username,
                    guild: guild?.name || 'Solo',
                })) as DatabaseObjectLinked;
                await interaction.editReply(
                    `You linked username ${username} who is ${
                        interaction.guild?.members.cache.get(databaseUser.id)?.user.tag
                    }, in guild **${guildName}**`
                );
            } else {
                role = roles?.find(a =>
                    a.name.toLowerCase().includes(guildName.toLowerCase())
                ) as Role;
                if (!role)
                    role = (await interaction.guild?.roles.create({
                        name: guildName,
                        hoist: true,
                        mentionable: false,
                    })) as Role;
                if (guild.owner.username === username) {
                    if (member.bannable) await member.setNickname(username + `・${guildName}`);
                    await member.roles.add(roles?.get(roleIds.leader) as Role);
                    await client.db.set(username, {
                        id: member.id,
                        guild: guildName,
                        rank: 'Leader',
                        username,
                    });
                    await interaction.editReply(
                        `You have forcelinked ${member.user.tag}'s account to ${username} in the ${guildName} guild with the **Leader** role.`
                    );
                }
                if (member.bannable) await member.setNickname(username + `・${guildName}`);
                const menuCustomId = 'role_sel_menu';
                const selectMenu = new StringSelectMenuBuilder()
                    .setCustomId(menuCustomId)
                    .setPlaceholder('Select a Guild Role')
                    .addOptions(
                        new SelectMenuOptionBuilder()
                            .setLabel('Guild Member')
                            .setValue('member')
                            .setDescription('Select the guild member role.'),
                        new SelectMenuOptionBuilder()
                            .setLabel('Guild Officer')
                            .setValue('officer')
                            .setDescription('Select the guild officer role.')
                    );
                const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
                    selectMenu
                );
                const embed = new EmbedBuilder()
                    .setTitle('Guild Role Selection (' + guildName + ')')
                    .setFooter({ text: 'PG Utilities・Atlas Development LLC' });
                const a = await interaction.editReply({
                    embeds: [embed],
                    components: [row],
                });
                const collector = a.createMessageComponentCollector({
                    filter: a => a.customId === menuCustomId && a.user.id === interaction.user.id,
                    time: 50_000,
                    componentType: ComponentType.StringSelect,
                });
                collector.on('collect', async collected => {
                    const selected = collected.values[0];
                    if (selected === 'officer') {
                        await member.roles.add(roleIds.officer);
                        await collected.update({
                            embeds: [],
                            components: [],
                            content: `You have linked ${member.user.tag}'s account to ${username} in the ${guildName} guild with the **Officer** role.`,
                        });
                    } else if (selected === 'member') {
                        await member.roles.add(roleIds.member);
                        await collected.update({
                            embeds: [],
                            components: [],
                            content: `You have linked ${member.user.tag}'s account to ${username} in the ${guildName} guild with the **Member** role.`,
                        });
                    }
                    await client.db.set(username, {
                        id: member.id,
                        guild: guildName,
                        rank: selected,
                        username,
                    });
                });
                member.roles.add('1072183092795674634');
            }

            await member.roles.add(role as Role);
            await (client.channels.cache.get('1075674018943864872') as TextChannel).send(
                `\`${member.user.tag}\` (${member.id}) was __FORCE__ linked with the username **${username}** by **\`${interaction.user.tag}\`** (${interaction.user.id})`
            );
        } catch (err: any) {
            if (err.response?.status === 404) {
                return await interaction.editReply(
                    'This player was not found or has their API is disabled.'
                );
            }
            // eslint-disable-next-line no-console
            console.log(err.response?.status, err);
        }
    },
});
