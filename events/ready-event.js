const { bot, BotVersion, logger } = require('../teaBot');
const { loadEventStatus, updateCodeCache } = require('../cache/tea-event-cache');

bot.on('ready', async () => {
    logger('update', `ready-event.js:1 () Trove Ethics Alliance Bot v${BotVersion} (${bot.user.tag}) has logged in!`, `New version: ${BotVersion}`);

    await loadEventStatus((err, res) => { // Module to load event status.
        if (err) return logger('error', `ready-event.js:1 loadEventStatus() Error to load event status value`, err);
        logger('mongo', `ready-event.js:2 loadEventStatus() ${res.message}`);
    });

    await updateCodeCache((err, res) => { // Update eventCodes array list.
        if (err) return logger('error', `rready-event.js:1 updateCodeCache() MongoDB error`, err);
        logger('event', `ready-event.js:2 updateCodeCache() ${res}`);
    });

    bot.user.setPresence({ activity: { name: ' ', type: 'WATCHING' }, status: 'idle' })
        .then(() => {
            setInterval(() => {
                let memberCount = 0;
                for (const guild of bot.guilds.cache) memberCount = memberCount + guild[1].memberCount;
                bot.user.setPresence({ activity: { name: `${memberCount} users 👮‍♂️`, type: 'WATCHING' }, status: 'online' });
            }, 3600000);
        })
        .catch(error => logger('error', `ready-event.js:2 () Error to set the bot activity status.`, error));
});