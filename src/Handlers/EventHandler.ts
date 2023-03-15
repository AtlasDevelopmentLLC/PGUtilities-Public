/* eslint-disable no-console */
import { ClientEvents } from 'discord.js';
import fs from 'fs';
import Client from '../Structures/Client.js';
import Event from '../Interfaces/Event.js';

console.log('EVENTS HANDLER HAS BEEN INITIATED:');
function EventHandler(client: Client): void {
    fs.readdir('./dist/Events', async (err, dirs) => {
        if (err) throw err;

        dirs.forEach(async dir => {
            const files = fs.readdirSync(`./dist/Events/${dir}`);

            files.forEach(async file => {
                const eventFile: Event<keyof ClientEvents> = await import(
                    `../Events/${dir}/${file}`
                ).then(imported => imported.default);
                const { event } = eventFile;
                console.log(`[HANDLER - EVENTS] Loaded a file: ${file}`);

                try {
                    client.on(event, (...args: ClientEvents[typeof event]) =>
                        eventFile.run(client, ...args)
                    );
                } catch (err) {
                    // eslint-disable-next-line no-console
                    console.error(err);
                }
            });
        });
    });
}

export default EventHandler;
