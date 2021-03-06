const { getEmoji, botReply } = require('../teaBot');
const config = require("../bot-settings.json");

module.exports.help = {
    name: "guilds",
    description: "Amount of clubs the bot is in.",
    type: "public",
    usage: `ℹ️ Format: **${config.botDetails.prefix}guilds**`
};

module.exports.run = async (bot, message) => {
    return botReply(`${getEmoji(config.botDetails.TEAserverID, 'TEA')} TEA is watching **${Math.round(bot.guilds.cache.size)}** clubs.`, message);
};