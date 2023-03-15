/* eslint-disable no-console */
import { ActivityType, RESTPostAPIApplicationCommandsJSONBody } from 'discord.js';
import Event from '../../Structures/Event.js';
export default new Event({
    event: 'ready',
    run: async client => {
        const guilds = (await client.db.all())
        .map(a => a.value.guild)
        .filter(function (item, i, ar) {
        return ar.indexOf(item) === i;
        });
        client.user?.setActivity(`${guilds.length} guilds!`, {
            type: ActivityType.Listening,
        });
        const guildCommands: RESTPostAPIApplicationCommandsJSONBody[] = [];
        client.commands.forEach(v => {
            guildCommands.push(v.data.toJSON());
        });
        await client.application?.commands.set([]);
        await client.guilds.cache.get('1043915194151211069')?.commands.set(guildCommands);
        console.log(`Bot is logged in as ${client.user?.tag}`);
    },
});
