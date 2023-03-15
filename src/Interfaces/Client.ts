import { Client as BaseClient, Collection } from 'discord.js';
import Command from './Command.js';
import ClientConfig from './ClientConfig.js';
import { QuickDB, MySQLDriver } from 'quick.db';
import BotClient from '../Structures/Client';

interface Client extends BaseClient {
    readonly commands: Collection<string, Command>;
    config: ClientConfig;
    init: () => Promise<BotClient>;
    db: QuickDB;
    mysqlDriver: MySQLDriver;
}

export default Client;
