const { Schema, model } = require("mongoose");

const eventPriorityPrizeModel = new Schema({
    name: { type: String, required: true, unique: true },
    available: { type: Boolean, required: true },
    priority: { type: String, required: true, lowercase: true }
}, {
    versionKey: false
});

module.exports.eventPriorityPrizeModel = model('event-priority-prizes', eventPriorityPrizeModel);