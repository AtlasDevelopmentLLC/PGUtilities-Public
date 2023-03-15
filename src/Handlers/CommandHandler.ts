/* eslint-disable no-console */
import fs from 'fs';
import Client from '../Structures/Client.js';
import Command from '../Interfaces/Command.js';

console.log('COMMANDS HANDLER HAS BEEN INITIATED:');
function CommandHandler(client: Client): void {
    fs.readdirSync('./dist/Commands').forEach(async dir => {
        const commands = fs
            .readdirSync(`./dist/Commands/${dir}`)
            .filter(file => file.endsWith('.js'));

        for (const file of commands) {
            const command: Command = await import(`../Commands/${dir}/${file}`).then(
                imported => imported.default
            );

            client.commands.set(command.data.name, command);
            console.log(
                `[HANDLER - SLASH] Loaded a file: ${dir}/${file} (#${client.commands.size})`
            );
        }
    });
}

export default CommandHandler;
