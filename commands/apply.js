const { botReply, logger, getEmoji, Discord, TEAlogo } = require("../teaBot");
const config = require('../bot-settings.json');
const fs = require('fs');

module.exports.help = {
    name: "apply",
    description: "Register your club to TEA!",
    type: "public",
    usage: `ℹ️ Format: **${config.botDetails.prefix}apply**`
};

module.exports.run = async (bot, message) => {
    let clubNameVar; // club name ✅
    let clubLevelVar; // level ✅
    let clubJoinworldVar; // joinworld command ✅
    let clubDescriptionVar; // description ✅
    let clubRequirementsVar; // requirements ✅
    let clubRepresentativeVar; // representative ✅
    let clubDiscordVar; // discord invite code ✅
    let cRequesterVar; // person who used this command ✅
    let clubMemberCountVar; // server member count

    const questionResponseTime = 600000; // 10 mins
    const filter = m => m.author.id === message.author.id; // await message filter
    const { guild, member, author } = message;

    if (guild.id != config.botDetails.TEAserverID) { // check if its not TEA server
        if (member.hasPermission('ADMINISTRATOR')) { // check if user is an admin
            if (guild.memberCount < 100) return botReply(`Unfortunately ${author}, your discord server doesn't meet your minimal member requirements (${guild.memberCount}/**100**), try again later.`, message);
            else {
                clubMemberCountVar = guild.memberCount;
                ClubNameQ(); // run the question chain
            }
        } else botReply(`${author} This command is only available for server admins!`, message);
    } else ClubNameQ(); // run the question chain


    function ClubNameQ(additionalText) {
        additionalText = (additionalText ? `**${additionalText}**\n` : '');

        return botReply(`${additionalText}> ${author} ${getEmoji(config.botDetails.TEAserverID, 'TEA')} Type \`cancel\` to exit.\n\n**Club Information**\n\`\`\`Please enter club name.\`\`\``, message)
            .then(Question => {
                message.channel.awaitMessages(filter, { max: 1, time: questionResponseTime })
                    .then(Answer => {
                        const answerContent = Answer.first().content;
                        // if (Question.deletable) Question.delete().catch((error) => logger('error', 'apply.js:1 ClubNameQ() Remove question', error));
                        if (answerContent.toLowerCase().startsWith(config.botDetails.prefix.toLowerCase()) || answerContent.startsWith(`<@!${bot.user.id}>`)) return;
                        else if (answerContent.toLowerCase() === 'exit' || answerContent.toLowerCase() === 'cancel') return botReply(`${author} ❌ Cancelled`, message);
                        else if (answerContent.length < 3) return ClubNameQ('❌ Club name is too short [3 characters].');
                        else if (answerContent.length > 20) return ClubNameQ('❌ Club name is too long [20 characters].');
                        else {
                            cRequesterVar = message.author;
                            clubNameVar = answerContent;
                            return checkClubName(answerContent);
                        }

                    }).catch(error => {
                        if (error.message === "Cannot read property 'content' of undefined") botReply(`${author} ❌ There was no message within the time limit (${Math.round(questionResponseTime / 60000)}mins)! - Cancelled.`, message);
                        else logger('error', 'apply.js:2 ClubNameQ() Answer error', error);
                    });
            });


        function checkClubName(clubName) {
            return fs.readFile('./cache/certification.json', 'utf8', (error, data) => {
                if (error) {
                    logger('error', 'apply.js:1 () Load certification.json file', error);
                    return botReply(`${author} ❌ Error to parse the data, try again later.`, message);
                }
                if (JSON.parse(data).find(club => club.guildName?.toLowerCase() === clubName.toLowerCase())) return botReply(`${author} Club **${clubName}**${getEmoji(config.botDetails.TEAserverID, 'verified')} is already registered in ${getEmoji(config.botDetails.TEAserverID, 'TEA')}TEA.`, message);
                else return clubLevelQ();
            });
        }
    }

    function clubLevelQ(additionalText) {
        additionalText = (additionalText ? `**${additionalText}**\n` : '');

        return botReply(`${additionalText}> ${author} ${getEmoji(config.botDetails.TEAserverID, 'TEA')} Type \`cancel\` to exit.\n\n**Club Information**\n\`\`\`Please enter club level.\`\`\``, message)
            .then(Question => {
                message.channel.awaitMessages(filter, { max: 1, time: questionResponseTime })
                    .then(Answer => {
                        const answerContent = Answer.first().content;
                        // if (Question.deletable) Question.delete().catch((error) => logger('error', 'apply.js:1 clubLevelQ() Remove question', error));
                        if (answerContent.toLowerCase().startsWith(config.botDetails.prefix.toLowerCase()) || answerContent.startsWith(`<@!${bot.user.id}>`)) return;
                        else if (answerContent.toLowerCase() === 'exit' || answerContent.toLowerCase() === 'cancel') return botReply(`${author} ❌ Cancelled`, message);
                        else if (isNaN(answerContent)) return clubLevelQ('❌ Invalid number, enter a number between 1 and 11.');
                        else if (Number(answerContent) < 1) return clubLevelQ('❌ Club level is too low.');
                        else if (Number(answerContent) > 11) return clubLevelQ('❌ Club level is too high.');
                        else {
                            clubLevelVar = answerContent;
                            return clubJoinworldQ();
                        }

                    }).catch(error => {
                        if (error.message === "Cannot read property 'content' of undefined") botReply(`${author} ❌ There was no message within the time limit (${Math.round(questionResponseTime / 60000)}mins)! - Cancelled.`, message);
                        else logger('error', 'apply.js:2 clubLevelQ() Answer error', error);
                    });
            });
    }

    function clubJoinworldQ(additionalText) {
        additionalText = (additionalText ? `**${additionalText}**\n` : '');

        return botReply(`${additionalText}> ${author} ${getEmoji(config.botDetails.TEAserverID, 'TEA')} Type \`cancel\` to exit.\n\n**Club Information**\n\`\`\`Enter joinworld command (/joinworld clubName)\`\`\``, message)
            .then(Question => {
                message.channel.awaitMessages(filter, { max: 1, time: questionResponseTime })
                    .then(Answer => {
                        const answerContent = Answer.first().content;
                        // if (Question.deletable) Question.delete().catch((error) => logger('error', 'apply.js:1 clubJoinworldQ() Remove question', error));
                        if (answerContent.toLowerCase().startsWith(config.botDetails.prefix.toLowerCase()) || answerContent.startsWith(`<@!${bot.user.id}>`)) return;
                        else if (answerContent.toLowerCase() === 'exit' || answerContent.toLowerCase() === 'cancel') return botReply(`${author} ❌ Cancelled`, message);
                        else if (!answerContent.toLowerCase().startsWith('/joinworld')) return clubJoinworldQ('❌ Club joinworld command must start with /joinworld.');
                        else if (answerContent.length < 14) return clubJoinworldQ('❌ Club joinworld command is too short [3 characters]');
                        else if (answerContent.length > 60) return clubJoinworldQ('❌ Club joinworld command is too long [60 characters].');
                        else {
                            clubJoinworldVar = answerContent;
                            return clubDescriptionQ();
                        }

                    }).catch(error => {
                        if (error.message === "Cannot read property 'content' of undefined") botReply(`${author} ❌ There was no message within the time limit (${Math.round(questionResponseTime / 60000)}mins)! - Cancelled.`, message);
                        else logger('error', 'apply.js:2 clubJoinworldQ() Answer error', error);
                    });
            });
    }

    function clubDescriptionQ(additionalText) {
        additionalText = (additionalText ? `**${additionalText}**\n` : '');

        return botReply(`${additionalText}> ${author} ${getEmoji(config.botDetails.TEAserverID, 'TEA')} Type \`cancel\` to exit.\n\n**Club Information**\n\`\`\`Type ${clubNameVar ? clubNameVar + "'s" : 'Your'} description.\`\`\``, message)
            .then(Question => {
                message.channel.awaitMessages(filter, { max: 1, time: questionResponseTime })
                    .then(Answer => {
                        const answerContent = Answer.first().content;
                        // if (Question.deletable) Question.delete().catch((error) => logger('error', 'apply.js:1 clubDescriptionQ() Remove question', error));
                        if (answerContent.toLowerCase().startsWith(config.botDetails.prefix.toLowerCase()) || answerContent.startsWith(`<@!${bot.user.id}>`)) return;
                        else if (answerContent.toLowerCase() === 'exit' || answerContent.toLowerCase() === 'cancel') return botReply(`${author} ❌ Cancelled`, message);
                        else if (answerContent.length < 10) return clubDescriptionQ('❌ Club description is too short [10 characters].');
                        else if (answerContent.length > 512) return clubDescriptionQ('❌ Club description is too long [512 characters].');
                        else {
                            clubDescriptionVar = answerContent;
                            return clubRequirementsQ();
                        }

                    }).catch(error => {
                        if (error.message === "Cannot read property 'content' of undefined") botReply(`${author} ❌ There was no message within the time limit (${Math.round(questionResponseTime / 60000)}mins)! - Cancelled.`, message);
                        else logger('error', 'apply.js:2 clubDescriptionQ() Answer error', error);
                    });
            });
    }

    function clubRequirementsQ(additionalText) {
        additionalText = (additionalText ? `**${additionalText}**\n` : '');

        return botReply(`${additionalText}> ${author} ${getEmoji(config.botDetails.TEAserverID, 'TEA')} Type \`cancel\` to exit.\n\n**Club Information**\n\`\`\`Enter ${clubNameVar ? clubNameVar : 'Club'} requirements.\`\`\``, message)
            .then(Question => {
                message.channel.awaitMessages(filter, { max: 1, time: questionResponseTime })
                    .then(Answer => {
                        const answerContent = Answer.first().content;
                        // if (Question.deletable) Question.delete().catch((error) => logger('error', 'apply.js:1 clubRequirementsQ() Remove question', error));
                        if (answerContent.toLowerCase().startsWith(config.botDetails.prefix.toLowerCase()) || answerContent.startsWith(`<@!${bot.user.id}>`)) return;
                        else if (answerContent.toLowerCase() === 'exit' || answerContent.toLowerCase() === 'cancel') return botReply(`${author} ❌ Cancelled`, message);
                        else if (answerContent.length < 3) return clubRequirementsQ('❌ Club requirements are too short [3 characters].');
                        else if (answerContent.length > 50) return clubRequirementsQ('❌ Club requirements are too long [50 characters].');
                        else {
                            clubRequirementsVar = answerContent;
                            return clubRepresentativeQ();
                        }

                    }).catch(error => {
                        if (error.message === "Cannot read property 'content' of undefined") botReply(`${author} ❌ There was no message within the time limit (${Math.round(questionResponseTime / 60000)}mins)! - Cancelled.`, message);
                        else logger('error', 'apply.js:2 clubRequirementsQ() Answer error', error);
                    });
            });
    }

    function clubRepresentativeQ(additionalText) {
        additionalText = (additionalText ? `**${additionalText}**\n` : '');

        return botReply(`${additionalText}> ${author} ${getEmoji(config.botDetails.TEAserverID, 'TEA')} Type \`cancel\` to exit.\n\n**Club Information**\n\`\`\`Club representative (discord#tag, in-game nick etc.).\`\`\``, message)
            .then(Question => {
                message.channel.awaitMessages(filter, { max: 1, time: questionResponseTime })
                    .then(Answer => {
                        const answerContent = Answer.first().content;
                        // if (Question.deletable) Question.delete().catch((error) => logger('error', 'apply.js:1 clubRepresentativeQ() Remove question', error));
                        if (answerContent.toLowerCase().startsWith(config.botDetails.prefix.toLowerCase()) || answerContent.startsWith(`<@!${bot.user.id}>`)) return;
                        else if (answerContent.toLowerCase() === 'exit' || answerContent.toLowerCase() === 'cancel') return botReply(`${author} ❌ Cancelled`, message);
                        else if (answerContent.length < 5) return clubRepresentativeQ('❌ Club representative is too short [5 characters].');
                        else if (answerContent.length > 70) return clubRepresentativeQ('❌ Club representative is too long [70 characters].');
                        else {
                            clubRepresentativeVar = answerContent;
                            return clubDiscordQ();
                        }

                    }).catch(error => {
                        if (error.message === "Cannot read property 'content' of undefined") botReply(`${author} ❌ There was no message within the time limit (${Math.round(questionResponseTime / 60000)}mins)! - Cancelled.`, message);
                        else logger('error', 'apply.js:2 clubRepresentativeQ() Answer error', error);
                    });
            });
    }

    function clubDiscordQ(additionalText) {
        additionalText = (additionalText ? `**${additionalText}**\n` : '');

        return botReply(`${additionalText}> ${author} ${getEmoji(config.botDetails.TEAserverID, 'TEA')} Type \`cancel\` to exit.\n\n**Club Information**\n\`\`\`Enter pernament discord invite code (without discord.gg link)\`\`\``, message)
            .then(Question => {
                message.channel.awaitMessages(filter, { max: 1, time: questionResponseTime })
                    .then(Answer => {
                        const answerContent = Answer.first().content;
                        // if (Question.deletable) Question.delete().catch((error) => logger('error', 'apply.js:1 clubDiscordQ() Remove question', error));
                        if (answerContent.toLowerCase().startsWith(config.botDetails.prefix.toLowerCase()) || answerContent.startsWith(`<@!${bot.user.id}>`)) return;
                        else if (answerContent.toLowerCase() === 'exit' || answerContent.toLowerCase() === 'cancel') return botReply(`${author} ❌ Cancelled`, message);
                        else if (answerContent.startsWith('https://')) return clubDiscordQ('❌ Just type invite code without link to it (last part of the link).');
                        else if (answerContent.length < 3) return clubDiscordQ('❌ Club invite code is too short [3 characters].');
                        else if (answerContent.length > 30) return clubDiscordQ('❌ Club invite code is too long [30 characters].');
                        else {
                            clubDiscordVar = answerContent;
                            // return userInputSummary();
                            // message.reply(userInputSummary());
                            return ConfirmationPromt();
                        }

                    }).catch(error => {
                        if (error.message === "Cannot read property 'content' of undefined") botReply(`${author} ❌ There was no message within the time limit (${Math.round(questionResponseTime / 60000)}mins)! - Cancelled.`, message);
                        else logger('error', 'apply.js:2 clubDiscordQ() Answer error', error);
                    });
            });
    }

    function ConfirmationPromt() {
        const embed_test = new Discord.MessageEmbed()
            .setColor('GREEN')
            .setDescription(`Description ▼\n${clubDescriptionVar}`)
            .setFooter('Click ✅ to confirm and send the form.')
            .addFields(
                { name: 'Club Name ▼', value: clubNameVar, inline: true },
                { name: 'Level ▼', value: clubLevelVar, inline: false },
                { name: 'Joinworld ▼', value: clubJoinworldVar, inline: false },
                { name: 'Requirements ▼', value: clubRequirementsVar, inline: false },
                { name: 'Representative ▼', value: `\`${clubRepresentativeVar}\``, inline: false },
                { name: 'Discord Invite ▼', value: `<https://discord.gg/${clubDiscordVar}>`, inline: false },
                { name: 'Requester ▼', value: `${cRequesterVar} • ${cRequesterVar?.tag} • ${cRequesterVar?.id}`, inline: false },
            )

        return message.channel.send(`> ${author} Are you **sure** to send this form?`, embed_test)
            .then(async Question => {
                if (Question) { // check if the bot sent question to the user, if so, collect one reply from the message.author.
                    const emojiFilter = (reaction, user) => { // accept interaction only from the message author
                        return ['✅', '❌'].includes(reaction.emoji.name) && !user.bot && author === user;
                    }

                    Question.awaitReactions(emojiFilter, { max: 1, time: questionResponseTime })
                        .then(collected => {
                            const reaction = collected.first();

                            switch (reaction.emoji.name) {
                                case '✅': return postResults();
                                case '❌': return botReply(`As you wish ${author}, cancelled!`, message);
                                default: return;
                            }
                        })
                        .catch(error => {
                            if (error.message === "Cannot read property 'emoji' of undefined") return botReply(`${author} ❌ There was no reaction within the time limit (${Math.round(questionResponseTime / 60000)}mins)! - Cancelled.`, message);
                            logger('error', `apply.js:1 ConfirmationPromt() Error when user answered the question.`, error);
                        });

                    try {
                        await Question.react('✅');
                        await Question.react('❌');
                    } catch (error) {
                        if (error.message === 'Unknown Message') return;
                        botReply(`${author} An unknown error occured ;(`, message);
                        logger('error', `apply.js:2 ConfirmationPromt() Error to add reactions probably wrong emojis or missing permissions.`, error);
                    }
                } else return logger('warn', `apply.js:3 ConfirmationPromt() Error to send the message`);
            }).catch(error => {
                botReply(`${author} ❌ An unknown error occured, try again later!`, message);
                logger(`apply.js:4 ConfirmationPromt() Error`, error);
            });

    }

    function postResults() {
        const registryChannel = bot.guilds.cache.get(config.botDetails.TEAserverID).channels.cache.get(config.channels.requestChannelID); // find registry channel on the main channel
        if (!registryChannel) {
            logger('error', 'apply.js:1 postResults() Missing registry channel on TEA main server');
            return botReply(`${author} Error to send club registry request, try again later ;-(`, message);
        }
        else {
            // define the embed: send apply to registry channel with provided information
            const embed_registry_message = new Discord.MessageEmbed()
                .setColor('GREEN')
                .setAuthor(`Alliance registry: '${clubNameVar}' ${clubMemberCountVar ? `(${clubMemberCountVar})` : ''}`, TEAlogo)
                .setDescription(clubDescriptionVar)
                .addFields(
                    { name: 'Club Name ▼', value: clubNameVar, inline: true },
                    { name: 'Level ▼', value: clubLevelVar, inline: false },
                    { name: 'Joinworld ▼', value: clubJoinworldVar, inline: false },
                    { name: 'Requirements ▼', value: clubRequirementsVar, inline: false },
                    { name: 'Representative ▼', value: `\`${clubRepresentativeVar}\``, inline: false },
                    { name: 'Discord Invite ▼', value: `<https://discord.gg/${clubDiscordVar}>`, inline: false },
                    { name: 'Requester ▼', value: `${cRequesterVar} • ${cRequesterVar?.tag} • ${cRequesterVar?.id}`, inline: false },
                )
                .setFooter('TEA Registry Request')

            registryChannel.send(embed_registry_message)
                .then(() => botReply(`> ${author} ${getEmoji(config.botDetails.TEAserverID, 'TEA')}TEA club registry request has been sent!`, message))
                .catch(err => {
                    logger('error', 'apply.js:2 postResults() Error to send embed message', err);
                    botReply(`${author} Error to send club registry request, try again later ;-(`, message);
                });
        }
    }
};