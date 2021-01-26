const { bot } = require('../teaBot');
const cron = require('node-cron');
const certification = require('../functions/update-certification');
const blacklist = require('../functions/update-tread-database');

bot.on('ready', () => {  // https://crontab.guru/examples.html
    cron.schedule('0 10 * * *', () => { // run certification update function daily at 10AM CEST
        const lastUpdate = new Date(Date.now()).toUTCString();
        console.log(`%c⧭ Certification Update [Daily] ${lastUpdate}`, 'color: #24ff24',);
        certification.certUpdate()
            .then(results => console.debug(`✅ update-database.js:1 👉 Certification has been updated: ${results}`))
            .catch(error => console.error(`update-database.js:2 ❌ Error to update club certifications ${error}`));
    });

    setTimeout(() => { // run certification update function at bot startup
        const lastUpdate = new Date(Date.now()).toUTCString(); // at bot startup
        console.log(`%c⧭ Certification Update [Bot startup] ${lastUpdate}`, 'color: #24ff24',);
        certification.certUpdate()
            .then(results => console.debug(`✅ update-database.js:3 👉 Certification has been updated: ${results}`))
            .catch(error => console.error(`update-database.js:4 ❌ Error to update club certifications ${error}`));
    }, 60000);

    //////////////////////////////////////////////////////////////////////////////////////////////

    cron.schedule('0 8 * * *', () => { // run thread update function daily at 8AM CEST
        const lastUpdate = new Date(Date.now()).toUTCString();
        console.log(`%c⧭ Thread Database Update [Daily] ${lastUpdate}`, 'color: #24ff24',);
        blacklist.treadUpdate()
            .then(results => console.debug(`✅ update-database.js:5 👉 Thread database has been updated: ${results}`))
            .catch(error => console.error(`update-database.js:6 ❌ Error to update thread database ${error}`));
    });

    setTimeout(() => { // run tread database function update at bot startup
        const lastUpdate = new Date(Date.now()).toUTCString();
        console.log(`%c⧭ Tread Database Update [Bot startup] ${lastUpdate}`, 'color: #daff61',);
        blacklist.treadUpdate()
            .then(results => console.debug(`✅ update-database.js:7 👉 Thread database has been updated: ${results}`))
            .catch(error => console.error(`update-database.js:8 ❌ Error to update thread database ${error}`));
    }, 60000 * 2);
});