import { DatabaseObjectLinked } from '../../Interfaces/LastObjectLinkAccount';
import Event from '../../Structures/Event.js';
import { TextChannel } from 'discord.js';

export default new Event({
    event: 'guildMemberRemove',
    run: async (client, member) => {
        const fromDB: { id: string; value: DatabaseObjectLinked } = (await client.db.all()).find(
            (a: { id: string; value: DatabaseObjectLinked }) => a.value.id === member.id
        ) as { id: string; value: DatabaseObjectLinked };
        if (!fromDB) return;
        await client.db.delete(fromDB.value.username);
        await (client.channels.cache.get('1075674018943864872') as TextChannel).send(
            `**${member.user.tag}** unlinked with the username **${fromDB.value.username}** (**MEMBER LEFT**)`
        );
    },
});
