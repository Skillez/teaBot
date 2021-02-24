const { bot, botReply, ownerDM, logger } = require('../teaBot');
const { botPrefix, botOwnerID, TEAserverID } = require('../bot-settings.json');
const { guildPrefix } = require('../cache/guild-prefixes');

bot.on("message", async message => {
    const { content, channel, guild, author } = message;
    if (author.bot) return;

    const prefixes = [guildPrefix(guild) || botPrefix, `<@!${bot.user.id}>`];
    logger('debug', 'Available custom prefixes for this guild', `${prefixes[0]}`);

    // // Check if message contain prefix to run the command.
    if (content.toLowerCase().startsWith(prefixes[0].toLowerCase())) { // custom prefix
        prefix = prefixes[0];
        args = content.slice(prefixes[0].length).trim().split(/ +/g);
    }
    else if (content.toLowerCase().startsWith(prefixes[1].toLowerCase())) { // bot mention prefix
        prefix = prefixes[1];
        args = content.slice(prefixes[1].length).trim().split(/ +/g);
    }
    else return;

    const command = args.shift().toLowerCase();
    const cmdFile = bot.commands.get(command);
    if (cmdFile) {
        // removeUserLastMessage(message);
        logger('info', `command-listener.js:1 () '${author.tag}' used '${(content.length > 40 ? `${content.slice(0, 40)}...` : `${content}`)}' on the ${(channel?.name ? `#${channel.name} channel` : 'direct message')}${(guild?.name ? ` in '${guild.name}' server` : '')}.`);
        switch (cmdFile.help.type?.toLowerCase()) {
            case 'botowner': {
                if (channel.type != "dm") {
                    if (author.id === botOwnerID) return cmdFile.run(bot, message, args, prefix);
                    else return botReply(`Insufficient permissions!\nOnly the bot owner can use **${botPrefix}${cmdFile.help.name}** command!`, message);
                } else return botReply(`**${botPrefix}${cmdFile.help.name}** is not available on DM!`, message);
            }
            case 'serverowner': {
                if (channel.type != "dm") {
                    if (author === guild.owner.user || author.id === botOwnerID) return cmdFile.run(bot, message, args, prefix);
                    else return botReply(`Insufficient permissions!\nOnly the server owner can use **${botPrefix}${cmdFile.help.name}** command!`, message);
                } else return botReply(`**${botPrefix}${cmdFile.help.name}** is not available on DM!`, message);
            }
            case "administrator": {
                if (channel.type != "dm") {
                    if (guild.id === TEAserverID && message.member.hasPermission("ADMINISTRATOR")) return cmdFile.run(bot, message, args, prefix);
                    else return botReply(`You don't have access to run **${botPrefix}${cmdFile.help.name}**!`, message);
                } else return botReply(`**${botPrefix}${cmdFile.help.name}** is not available on DM!`, message);
            }
            case "dm": if (channel.type === "dm") return cmdFile.run(bot, message, args, prefix);
            else return botReply(`**${botPrefix}${cmdFile.help.name}** is only available via direct message.`, message);

            case "public": if (channel.type != "dm") return cmdFile.run(bot, message, args, prefix)
            else return botReply(`**${botPrefix}${cmdFile.help.name}** is not available on DM!`, message);

            case "disabled": if (channel.type != "dm") return botReply(`**${botPrefix}${cmdFile.help.name}** is currently **disabled**!`, message);
            else return botReply(`**${botPrefix}${cmdFile.help.name}** is currently **disabled**!`, message);

            default: {
                botReply(`**${botPrefix}${cmdFile.help.name}** Command error, try again later!`, message);
                ownerDM(`Error with ${bot.user} application\n command-listener.js () One of the commands has incorrect type, check out console for more info.`);
                return logger('warn', `command-listener.js:2 command switch() default - incorrect type set for the '${botPrefix}${cmdFile.help.name}' command.`);
            }
        }
    }
});