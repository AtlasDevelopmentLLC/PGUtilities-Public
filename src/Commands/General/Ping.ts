import { SlashCommandBuilder } from 'discord.js';
import Command from '../../Structures/Command.js';
export default new Command({
    data: new SlashCommandBuilder().setName('ping').setDescription("View bot's ping"),
    run: async (client, interaction) => {
        await interaction.reply(`${client.ws.ping}ms`);
    },
});
