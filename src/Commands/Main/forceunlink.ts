import { DatabaseObjectLinked } from '../../Interfaces/LastObjectLinkAccount';
import Command from '../../Structures/Command.js';
import { PermissionFlagsBits, SlashCommandBuilder, TextChannel } from 'discord.js';

export default new Command({
    data: new SlashCommandBuilder()
        .setName('force_unlink')
        .setDescription('Force an unlink (Administrator+)')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(input =>
            input
                .setName('username')
                .setDescription('Username of the user to unlink. Use view_user command')
                .setRequired(true)
        ),
    run: async (client, interaction) => {
        if (!interaction.inGuild()) return;
        const username = interaction.options.get('username')?.value as string;
        if (!(await client.db.has(username)))
            return await interaction.reply({
                ephemeral: true,
                content: "This user has not linked their account.",
            });
        if (!/^[a-zA-Z0-9_]{2,16}$/gm.test(username))
            return await interaction.reply({
                ephemeral: true,
                content: 'The username provided is invalid!',
            });
        await interaction.deferReply({
            ephemeral: true,
        });
        const isThereAUser = await client.db.has(username);
        if (!isThereAUser) return await interaction.editReply('User not found.');
        const userDb = (await client.db.get(username)) as DatabaseObjectLinked;
        await client.db.delete(username);
        await (client.channels.cache.get('1075674018943864872') as TextChannel).send(
            `${interaction.guild?.members.cache.get(userDb.id)?.user.tag} (${
                userDb.id
            }) __FORCE__ unlinked with the username **${userDb.username}** by **${
                interaction.user.tag
            }** (${interaction.user.id})`
        );
        await interaction.guild?.members.cache.get(userDb.id)?.setNickname(userDb.username);
        await interaction.editReply(
            `You unlinked username ${username} from ${
                interaction.guild?.members.cache.get(userDb.id)?.user.tag
            }`
        );
    },
});
