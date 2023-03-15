import {
    CommandInteraction,
    SlashCommandBuilder,
    SlashCommandSubcommandsOnlyBuilder,
} from 'discord.js';

import ICommand from '../Interfaces/Command';
import Client from './Client.js';

class Command {
    readonly data:
        | SlashCommandBuilder
        | Omit<SlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'>
        | SlashCommandSubcommandsOnlyBuilder;
    readonly run: (client: Client, interaction: CommandInteraction) => unknown;
    constructor(commandOptions: ICommand) {
        this.run = commandOptions.run;
        this.data = commandOptions.data;
    }
}

export default Command;
