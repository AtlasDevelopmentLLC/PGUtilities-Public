import Command from '../../Structures/Command.js';
import { SlashCommandBuilder, TextChannel, bold } from 'discord.js';
import roleIds from '../../jsons/roles.json' assert { type: 'json' };
import channels from '../../jsons/channels.json' assert { type: 'json' };

export default new Command({
    data: new SlashCommandBuilder()
        .setName('unlink')
        .setDescription('Unlink your account from the PG database.'),
    run: async (client, interaction) => {
        await interaction.deferReply({ ephemeral: true });
        const userDb = (await client.db.all()).find(a => a.value.id === interaction.user.id);
        if (!userDb) return await interaction.editReply('You have not linked your account yet.');
        const member = await interaction.guild?.members.fetch(interaction.user.id);

        const role = member?.roles.cache.find(r =>
            r.name.toLowerCase().includes(userDb.value.guild.toLowerCase())
        );
        member?.roles.remove([
            roleIds.guild.leader,
            roleIds.guild.member,
            roleIds.guild.officer,
            roleIds.linked,
            roleIds.solo,
        ]);
        if (role) member?.roles.remove(role?.id);
        await client.db.delete(userDb.id);
        await (client.channels.cache.get(channels.linking.logs) as TextChannel).send(
            `${bold(interaction.user.tag)}'s account unlinked from the username ${bold(
                userDb.value.username
            )}`
        );
        interaction.guild?.members.cache
            .get(interaction.user.id)
            ?.setNickname(interaction.user.username)
            .catch(() => {
                return;
            });
        await interaction.editReply('You have successfully unlinked your account.');
    },
});
