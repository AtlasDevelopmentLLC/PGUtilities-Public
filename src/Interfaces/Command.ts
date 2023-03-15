import {
    CommandInteraction,
    SlashCommandBuilder,
    SlashCommandSubcommandsOnlyBuilder,
} from 'discord.js';
import Client from '../Structures/Client.js';

interface Command {
    readonly data:
        | SlashCommandBuilder
        | Omit<SlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'>
        | SlashCommandSubcommandsOnlyBuilder;
    readonly run: (client: Client, interaction: CommandInteraction) => unknown;
    readonly hideInHelp?: boolean;
    readonly devGuildOnly?: boolean;
}

export default Command;
