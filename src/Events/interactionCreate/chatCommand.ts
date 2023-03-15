/* eslint-disable no-console */
import Event from '../../Structures/Event.js';
import { ActivityType } from 'discord.js';
export default new Event({
    event: 'interactionCreate',
    run: async (client, interaction) => {
        const guilds = (await client.db.all())
        .map(a => a.value.guild)
        .filter(function (item, i, ar) {
        return ar.indexOf(item) === i;
        });
        client.user?.setActivity(`${guilds.length} guilds!`, {
            type: ActivityType.Listening,
        });
        if (!interaction.isChatInputCommand()) return;
        if (!client.commands.has(interaction.commandName))
            return await interaction.reply('Sorry! An error occurred...');
        const { commandName } = interaction;
        const command = client.commands.get(commandName);

        if (!command) return await interaction.reply('Command not found...');
        try {
            await command.run(client, interaction);
        } catch (err) {
            console.error(err);
            if (interaction.replied || interaction.deferred)
                return await interaction.editReply('Sorry! An error occurred!');
            return interaction.reply('An error occurred!');
        }
    },
});
