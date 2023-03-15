import BotClient from './Structures/Client.js';
new BotClient().init().then(client => {
    client.db.all().then(db => {
        const users = db.map(a => a.value.id);
        users.forEach(user => {
            const userAs = user as string;
            const discordMember = client.guilds.cache
                .get('1043915194151211069')
                ?.members.cache.get(userAs);
            if (discordMember && !discordMember.roles.cache.has('1072183092795674634')) {
                console.log(discordMember.roles.cache.has('1072183092795674634'));
                discordMember?.roles
                    .add('1072183092795674634')
                    .then(m => {
                        console.log('Added linked role to ' + m.user.tag);
                    })
                    .catch(err => {
                        console.error(err);
                    });
            }
        });
    });
});
