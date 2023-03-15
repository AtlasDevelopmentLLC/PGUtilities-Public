import Command from '../../Structures/Command.js';
import { PermissionFlagsBits, SlashCommandBuilder, TextChannel } from 'discord.js';
import ConfigJson from '../../jsons/config.json' assert { type: 'json' };
export default new Command({
    data: new SlashCommandBuilder()
        .setName('force_reset')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDescription(`Reset PG's entire database! (Owner only)`),
    run: async (client, interaction) => {
        const ownerIds = ConfigJson.owners;
        if (!Object.values(ownerIds).includes(interaction.user.id))
            return await interaction.reply('This is a command reserved for owners only.');
        const all = await client.db.all();
        const userIds = all.map(a => a.value.id);
        userIds.forEach(async id => {
            const member = client.guilds.cache
                .get(interaction.guildId as string)
                ?.members.cache.get(id);
            if (member && member.roles.cache.has('1072183092795674634')) {
                await member.roles.remove('1072183092795674634');
                await member.setNickname(member.user.username);
            }
        });
        await client.db.deleteAll();
        await interaction.reply('Reset all databases.');
        await (client.channels.cache.get('1075674018943864872') as TextChannel).send(
            `${interaction.user.tag} has **RESET** the database!`
        );
        console.log(`${interaction.user.tag} (${interaction.user.id}) RESET THE DATABASE!`);
        return;
    },
});
