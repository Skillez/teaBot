const { MongoClient } = require("../functions/mongodb-connection");
const { eventCodeModel } = require("../schema/event-codes");
const { eventSettingsModel } = require("../schema/event-settings");
const { logger } = require("../teaBot");

let eventStatus = { status: false }; // default: { status: false }
let blockEventCommand = { status: false }; // switch to disable event command while processing requests | default: { status: false }
let eventCodes = [];

/**
 * Return event cache data 'eventstatus'/'blockevent'/'eventcodes'.
 * @param {string} type - 'eventstatus' - returns boolean from eventStatus Object | 'blockevent' returns boolean from blockEventCommand Object | 'eventcodes' returns array of available global codes ID
 */
function checkEventCache(type) {
    if (type === 'eventstatus') return eventStatus.status;
    else if (type === 'blockevent') return blockEventCommand.status;
    else if (type === 'eventcodes') return eventCodes;
}

/**
 * Update event status value in the eventStatus Object inside the tea-event-cache.js file.
 * @param {boolean} status - boolean - enable/disable event command while processing
 */
function blockEventWhileProcessing(status) {
    logger('debug', `blockEventCommand set to ${status.toString().toUpperCase()} at '${Date.now()}'`);
    blockEventCommand = { status };
}

/**
 * Callback for updateEventStatus.
 *
 * @callback callbackInfo
 * @param {Object} err - Error Object.
 * @param {Object} res - Response from callback (res.message - String with results), res.doc - document from the database
 */

/**
 * Update event status value in the eventStatus Object inside the tea-event-cache.js file.
 * @param {boolean} status - boolean - enable/disable event system commands
 * @param {callbackInfo} callback - A callback to run.
 */
async function updateEventStatus(status, callback) {
    await MongoClient().then(async () => {

        await eventSettingsModel.findOneAndUpdate({ id: 'event-status' }, { id: 'event-status', status }, { upsert: true, new: true })
            .then(doc => {

                if (doc) {
                    eventStatus = { status: doc.status };
                    callback(null, { message: `Status set to '${status}' in the '${doc.id}' document.`, doc });
                } else callback(new Error(`'event-status' document was not found.`), null);
            }).catch(err => callback(err, null));
    }).catch(err => callback(err, null));
}

/**
 * Callback for loadEventStatus.
 *
 * @callback callbackInfo
 * @param {Object} err - Error Object.
 * @param {Object} res - Response from callback (res.message - String with results), res.doc - document from the database
 */

/**
 * Load event status value from the MongoDB document and update eventStatus Object in the tea-event-cache.js file.
 * @param {callbackInfo} callback - A callback to run.
 */
async function loadEventStatus(callback) {
    await MongoClient().then(async () => { // connect to MongoDB

        await eventSettingsModel.findOne({ id: 'event-status' }).exec()
            .then(async doc => {

                if (doc) {
                    eventStatus = { status: doc.status };
                    callback(null, { message: `Successfully loaded '${doc.id}' with '${doc.status}' status from the '${eventSettingsModel.collection.name}' collection.`, eventStatus });
                } else {
                    await eventSettingsModel.create({ id: 'event-status' })
                        .then(doc => {
                            eventStatus = { status: doc.status };
                            callback(null, { message: `Successfully created and loaded '${doc.id}' with '${doc.status}' status from the '${eventSettingsModel.collection.name}' collection.`, eventStatus })
                        })
                        .catch(err => callback(err, null));
                }

            }).catch(err => callback(err, null));
    }).catch(err => callback(err, null));
}

/**
 * Update 'eventCodes' array with code ID documents from code collection.
 * @param {callbackInfo} callback A callback to run.
 */
async function updateCodeCache(callback) {
    if (eventStatus.status === false) return;
    eventCodes = [];

    await MongoClient().then(async () => { // Connect to the MongoDB server.

        await eventCodeModel.find({ available: true, group: 'global' }) // Run a query.
            .then(docs => {
                if (!docs) return callback(null, `Not found available global codes right now.`); // stop if no docs were found.
                docs.forEach(doc => eventCodes.push(doc.id)); // Add codes ID to the array.
                callback(null, `eventCodes array has been updated correctly (${eventCodes.length}).`, eventCodes);

            }).catch(err => callback(err, null));
    }).catch(err => callback(err, null));
}

module.exports = {
    checkEventCache,
    updateEventStatus,
    loadEventStatus,
    blockEventWhileProcessing,
    updateCodeCache
}