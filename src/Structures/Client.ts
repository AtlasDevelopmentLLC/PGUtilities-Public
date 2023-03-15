import Discord, { Collection, REST } from 'discord.js';
import config from '../jsons/config.json' assert { type: 'json' };
import ClientConfig from '../Interfaces/ClientConfig';
import Command from '../Interfaces/Command';
import CommandHandler from '../Handlers/CommandHandler.js';
import EventHandler from '../Handlers/EventHandler.js';
import { QuickDB, MySQLDriver } from 'quick.db';
import 'dotenv/config';
class BotClient extends Discord.Client {
    constructor() {
        super({
            intents: [
                'MessageContent',
                'GuildMessages',
                'GuildMembers',
                'GuildMessageReactions',
                'GuildPresences',
                'Guilds',
            ],
        });
    }
    config: ClientConfig = config;
    commands: Collection<string, Command> = new Discord.Collection();
    rest = new REST({ version: '10' }).setToken(this.config.token);
    mysqlDriver = new MySQLDriver({
        host: process.env.MYSQL_HOST,
        database: process.env.MYSQL_DB,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASS,
        port: 3306,
    });
    db: QuickDB = null as unknown as QuickDB;
    async init() {
        await this.login(this.config.token);
        await this.mysqlDriver.connect();
        this.db = new QuickDB({ driver: this.mysqlDriver });
        await CommandHandler(this);
        await EventHandler(this);
        return this;
    }
}
export default BotClient;
