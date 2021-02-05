const { logger } = require("../functions/logger");
const { botReply } = require("../teaBot");

module.exports.help = { 
    name: "ping",
    description: "Pong!",
    type: "public",
    usage: "Type the command without any arguments."
};

module.exports.run = async (bot, message) => {
    const ping = await botReply('🏓 Pinging...', message);

    ping?.edit(`🏓 Pong! \nLatency is **${Math.floor(ping.createdAt - message.createdAt)}** ms\nAPI Latency is **${Math.round(bot.ws.ping)}** ms.`)
        // .then(msg => msg.delete({ timeout: 30000 }))
        .catch(error => logger('error', 'ping.js:1 () Edit the message', error));
}