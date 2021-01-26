// update-tread-database.js
// ================================

const config = require("../bot-settings.json");
const { google } = require('googleapis');
const keys = require('../Laezaria-Bot-292d692ec77c.json');

const mysql = require('mysql2');
const pool = mysql.createPool({
    connectionLimit: 1,
    host: config.mysql.host,
    user: config.mysql.user,
    password: config.mysql.password,
    database: config.mysql.database
});

pool.on('acquire', function (connection) {
    console.debug(`%c⧭ update-tread-database.js.js:1 - Connection ${connection.threadId} acquired`, 'color: #ffffff');
});

pool.on('release', function (connection) {
    console.debug(`%c⧭ update-tread-database.js.js:2 - Connection ${connection.threadId} released`, 'color: #ffffff');
});

pool.on('enqueue', function () {
    console.debug('%c⧭ update-tread-database.js.js:3 - Waiting for available connection slot!', 'color: #ff1100');
});

function treadUpdate() {
    const timer = process.hrtime();
    return new Promise((resolve, reject) => {
        const spreadsheet = new google.auth.JWT(
            keys.client_email,
            null,
            keys.private_key,
            ['https://www.googleapis.com/auth/spreadsheets']
        );

        spreadsheet.authorize(function (error, tokens) { // Login to spreadsheet service
            if (error) return reject(error);
            gsrun(spreadsheet);
        });

        async function gsrun(cl) {
            const gsapi = google.sheets({ version: 'v4', auth: cl });

            const data = await gsapi.spreadsheets.values.get({ // Get data object from the spreadsheet.
                spreadsheetId: config.blacklist.spreadsheetID,
                range: config.blacklist.spreadsheetRange
            }).catch(reject);

            if (!data) return; // return if data object doesn't exist aka error above.
            const TEA = data.data.values.filter(value => Object.keys(value).length != 0 && value[2] != '' && value[10] != ''); // filter out empty rows.

            let JSONobj = [];
            TEA.forEach(element => { // create a forEach[spreadsheed row] loop and push data to JSONobj array.

                // Transform undefined or empty cells into null object.
                const userName = (!element[2] || element[2].length < 3 ? null : element[2]);
                const userWarning = (element[4] === '' || !element[4] ? null : element[4]);
                const userlastName = (element[6] === '' || !element[6] ? null : element[6]);
                const userReason = (element[8] === '' || !element[8] ? null : element[8]);
                const userStatus = (element[10] === '' || !element[10] ? null : element[10]);
                const userEvidence = [element[12], element[13], element[14], element[15]].filter(Boolean).join('\n');
                const userAlternate = (element[17] === '' || !element[17] ? null : element[17]);
                const userDiscord = (element[19] === '' || !element[19] ? null : element[19]);
                const userNotes = (element[21] === '' || !element[21] ? null : element[21]);
                const userPersonal = (element[23] === '' || !element[23] ? null : element[23]);

                // userName is used as a primary key in database so can't be empty.
                if (!userName) return;

                // push spreadsheet row element to JSONobj array
                JSONobj.push([userName, userWarning, userlastName, userReason, userStatus, userEvidence, userAlternate, userDiscord, userNotes, userPersonal]);
            });

            pool.getConnection(function (error, connection) {
                if (error) {
                    reject(error);
                    return; console.error(`update-tread-database.js.js:1 treadUpdate() ❌ MySQL login error: '${error.code}'`);
                }
                runQuery(connection);
            })

            function runQuery(connection) {
                // Use the connection to TRUNCATE the current table data
                connection.query(`TRUNCATE ${config.mysql.tread_table_name}`, function (error, results, fields) {
                    if (error) {
                        pool.releaseConnection(connection);
                        reject(error);
                        return; console.error(`update-tread-database.js.js:2 treadUpdate() ❌ TRUNCATE query error: '${error.code}'`);
                    }

                    // Run another query to put data into cleared table
                    connection.query(`INSERT INTO ${config.mysql.tread_table_name} (name, warning, lastKnownName, reason, status, evidence, alternateAccounts, discordID, notes, privateWorld) VALUES ?`, [JSONobj], function (error, results, fields) {
                        if (error) {
                            pool.releaseConnection(connection);
                            reject(error);
                            return; console.error(`update-tread-database.js.js:3 treadUpdate() ❌ INSERT query error: '${error.code}'`);
                        }

                        // if all was good relase the connection and resolve function
                        pool.releaseConnection(connection);
                        const timeDiff = process.hrtime(timer);
                        // resolve(`👉 Thread database has been updated: '${results.info}' in ${timeDiff[0]}.${timeDiff[1].toString().slice(0, 3)}s.`);
                        resolve(`'${results.info}' in ${timeDiff[0]}.${timeDiff[1].toString().slice(0, 3)}s.`);
                    })
                })
            }
        }
    })
}

module.exports.treadUpdate = treadUpdate;