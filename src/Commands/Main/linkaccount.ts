/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    ActionRowBuilder,
    ComponentType,
    EmbedBuilder,
    GuildMember,
    Role,
    SlashCommandBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
    TextChannel,
    bold,
} from 'discord.js';
import Command from '../../Structures/Command.js';
import axios from 'axios';
import { PikaUserStatsResponse } from '../../Interfaces/PikaAPIResponse';
import LastObjectLinkAccount from '../../Interfaces/LastObjectLinkAccount.js';
import BotClient from '../../Structures/Client';
import { CommandInteraction } from 'discord.js';
import roleIds from '../../jsons/roles.json' assert { type: 'json' };
import channels from '../../jsons/channels.json' assert { type: 'json' };
export default new Command({
    data: new SlashCommandBuilder()
        .setName('linkaccount')
        .setDescription('Link your account to the PG database.')
        .addStringOption(input =>
            input
                .setName('username')
                .setDescription('Your username in PikaNetwork')
                .setRequired(true)
        ),
    run: async (client, interaction) => {
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
        await withDb(client, interaction, username);
    },
});
async function withDb(client: BotClient, interaction: CommandInteraction, username: string) {
    const roles = await interaction.guild?.roles.fetch();
    try {
        const response = await axios.get(`https://stats.pika-network.net/api/profile/${username}`);
        const data: PikaUserStatsResponse = response.data;
        const guild = data.clan;
        const member = interaction.guild?.members.cache.get(interaction.user.id) as GuildMember;
        if (!guild) {
            await member.setNickname(member.user.username + `・Solo`).catch(() => {
                return;
            });
            await member.roles.add(roleIds.solo);
            await client.db.set(username, { id: interaction.user.id, guild: 'Solo', username });
            await interaction.editReply('Your account has been declared guildless.');
            await ifSuccess(interaction, username, client, 'Solo');
            return;
        }
        const guildName = guild.name;
        let role = roles?.find(a => a.name.toLowerCase().includes(guildName.toLowerCase()));
        if (!role)
            role = await interaction.guild?.roles.create({
                name: guildName,
                hoist: true,
                mentionable: false,
            });
        await member.roles.add(role as Role);
        if (guild.owner.username === username) {
            await member.roles.add(roles?.get(roleIds.guild.leader) as Role);
            await client.db.set(username, {
                id: interaction.user.id,
                guild: guildName,
                rank: 'Leader',
                username,
            });
            await interaction.editReply(
                `You have linked your account to ${username} in the ${guildName} guild with the **Leader** role.`
            );
            await ifSuccess(interaction, username, client, guildName);
            return;
        }
        if (member.bannable)
            await member.setNickname(username + `・${guildName}`).catch(() => {
                return;
            });
        const menuCustomId = 'role_sel_menu';
        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId(menuCustomId)
            .setPlaceholder('Select a Guild Role')
            .addOptions(
                new StringSelectMenuOptionBuilder()
                    .setLabel('Guild Member')
                    .setValue('member')
                    .setDescription('Select the guild member role.'),
                new StringSelectMenuOptionBuilder()
                    .setLabel('Guild Officer')
                    .setValue('officer')
                    .setDescription('Select the guild officer role.')
            );
        const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);
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
                await member.roles.add(roleIds.guild.officer);
                await ifSuccess(interaction, username, client, guildName);
                await collected.update({
                    embeds: [],
                    components: [],
                    content: `You have linked your account to ${username} in the ${guildName} guild with the **Officer** role.`,
                });
            } else if (selected === 'member') {
                await member.roles.add(roleIds.guild.member);
                await ifSuccess(interaction, username, client, guildName);
                await collected.update({
                    embeds: [],
                    components: [],
                    content: `You have linked your account to ${username} in the ${guildName} guild with the **Member** role.`,
                });
            }
            await client.db.set(username, {
                id: interaction.user.id,
                guild: guildName,
                rank: selected,
                username,
            });
            return;
        });
    } catch (err: any) {
        if (err.response?.status === 404) {
            await interaction.editReply('This player was not found or has their API is disabled.');
            await ifError(
                interaction,
                client,
                username,
                'This player was not found or has their API is disabled'
            );
            return;
        }
        // eslint-disable-next-line no-console
        console.log(err.response?.status, err);
        await ifError(interaction, client, username, err.message);
    }
}
async function ifSuccess(
    interaction: CommandInteraction,
    username: string,
    client: BotClient,
    guildName
) {
    (await interaction.guild?.members.cache.get(interaction.user.id))?.roles.add(roleIds.linked);
    await interaction.followUp({
        content: 'You have succesfully linked your account!',
        ephemeral: true,
        allowedMentions: {
            parse: [],
        },
    });
    interaction.guild?.members.cache
        .get(interaction.user.id)
        ?.setNickname(`${username}・${guildName}`)
        .catch(() => {
            return;
        });
    const channel = client.channels.cache.get(channels.linking.logs) as TextChannel;
    channel.send(`${bold(interaction.user.tag)} has linked their account to ${bold(username)}.`);
}
async function ifError(
    interaction: CommandInteraction,
    client: BotClient,
    username: string,
    error: any
) {
    await interaction.followUp({
        content: 'Sorry but the linking was unsuccessful.',
        ephemeral: true,
    });
    const channel = client.channels.cache.get(channels.linking.error) as TextChannel;
    channel.send(
        `An error occurred when ${bold(interaction.user.tag)} tried to link with username: ${bold(
            username
        )}.\nError: ${bold(error)}`
    );
}
