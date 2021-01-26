const Discord = require('discord.js');
const config = require("./bot-settings.json");
const fs = require('fs');
require('console-stamp')(console, 'dd/mm/yyyy - HH:MM:ss');

const bot = new Discord.Client({ partials: ['MESSAGE', 'REACTION'] });

// define current bot version
const BotVersion = 'pre.alpha11';

// define icon image url for embeds
const TEAlogo = 'https://skillez.eu/images/discord/teabanner.png'

const emojiCharacters = {
	a: '🇦', b: '🇧', c: '🇨', d: '🇩',
	e: '🇪', f: '🇫', g: '🇬', h: '🇭',
	i: '🇮', j: '🇯', k: '🇰', l: '🇱',
	m: '🇲', n: '🇳', o: '🇴', p: '🇵',
	q: '🇶', r: '🇷', s: '🇸', t: '🇹',
	u: '🇺', v: '🇻', w: '🇼', x: '🇽',
	y: '🇾', z: '🇿', 0: '0⃣', 1: '1⃣',
	2: '2⃣', 3: '3⃣', 4: '4⃣', 5: '5⃣',
	6: '6⃣', 7: '7⃣', 8: '8⃣', 9: '9⃣',
	10: '🔟', '#': '#⃣', '*': '*⃣',
	'!': '❗', '?': '❓', 'i': 'ℹ️',
};

// Load commands and events
bot.commands = new Discord.Collection();

fs.readdir('./commands/', (err, files) => {
	if (err) console.error(err);

	let jsfiles = files.filter(f => f.split('.').pop() === 'js');
	if (jsfiles.length <= 0) return console.log('▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\nThere are no commands to load...\n\n');

	console.log(`▬▬▬▬▬▬▬▬ LOADED COMMANDS (${jsfiles.length}) ▬▬▬▬▬▬▬▬`);
	jsfiles.forEach((f, i) => {

		let props = require(`./commands/${f}`);
		console.log(`${i + 1}: ${props.help.type} - ${f}`);
		bot.commands.set(props.help.name, props);
	});
});

fs.readdir('./events/', (err, files) => {
	if (err) console.error(err);

	let jsfiles = files.filter(f => f.split('.').pop() === 'js');
	if (jsfiles.length <= 0) return console.log('▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\nThere are no events to load...\n\n');

	console.log(`\n▬▬▬▬▬▬▬▬ LOADED EVENTS (${jsfiles.length}) ▬▬▬▬▬▬▬▬`);
	jsfiles.forEach((f, i) => {
		require(`./events/${f}`);
		console.log(`${i + 1}: ${f}`);
	});
});

module.exports = {
	bot: bot, // bot client
	Discord: Discord, // discord module
	TEAlogo: TEAlogo, // defines icon image url for embeds
	BotVersion: BotVersion, // defines current bot version
	emojiCharacters: emojiCharacters, // defines some discord emojis

	ownerDM: function (message) {
		let Owner = bot.users.cache.get(config.BotOwnerID);
		Owner.send(message).catch(() => { return; });
	},

	errorLog: function (text, error) {
		if (!error) error = '';
		if (!text) text = 'Text is not provided';

		if (!bot.users.cache.get(config.BotOwnerID)) return console.warn(`teaBot.js:1 errorLog() ❌ The bot Owner is UNDEFINED (probably wrong userID in: config.BotOwnerID)`);
		bot.users.cache.get(config.BotOwnerID).send(`❌ an issue occurred with the **${bot.user.username}** application!` + "```" + text + "```" + error)
			.then(() => console.error(`${text}`, error))
			.catch((error) => { console.warn(`teaBot.js:2 errorLog() ❌ Owner has DMs disabled.`, error) });
	},

	getCommand: function (commandName) {
		return bot.commands.get(commandName);
	},

	getCommands: function () {
		return bot.commands;
	},

	// botReply: function (text, message, time, deleteStatus) {
	// 	if (deleteStatus) {
	// 		return message.channel.send(text)
	// 			.then(message => { if (message && message.deletable) message.delete({ timeout: time }).catch(() => { }); });
	// 	} else return message.channel.send(text);
	// },

	botReply: function (text, message, time, deleteStatus, attachFile, embedImage) {
		if (embedImage) {
			if (deleteStatus) {
				if (text) {
					const imageFileSplit = embedImage.split('/').slice(-1).toString();
					const embed_message = new Discord.MessageEmbed()
						.setColor('RANDOM')
						.attachFiles([embedImage])
						.setImage(`attachment://${imageFileSplit}`)
					return message.reply(text, embed_message)
						.then(message => { if (message && message.deletable) message.delete({ timeout: time }).catch(() => { }); });
				} else {
					const imageFileSplit = embedImage.split('/').slice(-1).toString();
					const embed_message = new Discord.MessageEmbed()
						.setColor('RANDOM')
						.attachFiles([embedImage])
						.setImage(`attachment://${imageFileSplit}`)
					return message.reply(embed_message)
						.then(message => { if (message && message.deletable) message.delete({ timeout: time }).catch(() => { }); });
				}
			}
			else if (text) {
				const imageFileSplit = embedImage.split('/').slice(-1).toString();
				const embed_message = new Discord.MessageEmbed()
					.setColor('RANDOM')
					.attachFiles([embedImage])
					.setImage(`attachment://${imageFileSplit}`)
				return message.reply(text, embed_message);
			} else {
				const imageFileSplit = embedImage.split('/').slice(-1).toString();
				const embed_message = new Discord.MessageEmbed()
					.setColor('RANDOM')
					.attachFiles([embedImage])
					.setImage(`attachment://${imageFileSplit}`)
				return message.reply(embed_message);
			}
		}
		else if (attachFile) {
			// Create the attachment using MessageAttachment
			const attachment = new Discord.MessageAttachment(attachFile);

			if (deleteStatus) {
				return message.reply(text, attachment)
					.then(message => { if (message && message.deletable) message.delete({ timeout: time }).catch(() => { }); });
			} else return message.reply(text, attachment);
		}
		else if (deleteStatus) {
			return message.reply(text,)
				.then(message => { if (message && message.deletable) message.delete({ timeout: time }).catch(() => { }); });
		} else return message.reply(text);
	},

	embedMessage: function (text, user) {
		if (!user) {
			// Send an embed message without footer
			const embed_message = new Discord.MessageEmbed()
				.setDescription(text)
				.setColor('#0095ff')
			return embed_message;
		} else {
			// Send an embed message with footer
			const embed_message = new Discord.MessageEmbed()
				.setDescription(text)
				.setColor('#0095ff')
				.setFooter(user.tag, user.displayAvatarURL())
			return embed_message;
		}
	},

	TEAemoji: function () {
		let TEAemoji = bot.guilds.cache.get(config.TEAserverID).emojis.cache.find(emoji => emoji.name === 'TEA');
		if (TEAemoji) return TEAemoji;
		else return TEAemoji = '';
	},

	getEmoji: function (serverID, emojiName) {
		let getEmoji = bot.guilds.cache.get(serverID).emojis.cache.find(emoji => emoji.name === emojiName);
		if (getEmoji) return getEmoji;
		else return getEmoji = '🐛';
		// else return undefined;
	},

	messageRemoverWithReact: async function (message, author) {
		await message.react('❌').catch(() => { return });

		const emojiFilter = (reaction, user) => {
			return ['❌'].includes(reaction.emoji.name) && !user.bot && author === user;
		}

		message.awaitReactions(emojiFilter, { max: 1, time: 60000 })
			.then(collected => {
				const reaction = collected.first();
				if (reaction.emoji.name === '❌') return message.delete().catch(() => { return });
			})
			.catch(error => {
				if (error.message === "Cannot read property 'emoji' of undefined") return message.delete().catch(() => { return });

				if (!bot.users.cache.get(config.BotOwnerID)) return console.warn(`teaBot.js:4 messageRemoverWithReact() ❌ The bot Owner is UNDEFINED (probably wrong userID in: config.BotOwnerID)`);
				bot.users.cache.get(config.BotOwnerID).send(`❌ an issue occurred with the **${bot.user.username}** application!` + "```" + `teaBot.js:5 messageRemoverWithReact()` + "```" + error)
					.then(() => console.error(`teaBot.js:5 messageRemoverWithReact().`, error))
					.catch((error) => { console.warn(`teaBot.js:6 messageRemoverWithReact() ❌ Owner has DMs disabled.`, error) });
			});
	},


	sendEmbedLog: function (embedMessage, channelID, webHookName) {
		const logChannel = bot.channels.cache.get(channelID);
		if (!logChannel) return console.error(`teaBot.js:1 sendEmbedLog() provided channelID(${channelID}) doesn't exist.`);
		else {

			logChannel.fetchWebhooks()
				.then(hooks => {
					const existingHook = hooks.find(hook => hook.owner === bot.user && hook.name === webHookName);

					if (!existingHook) {
						return logChannel.createWebhook(webHookName, {
							avatar: 'https://skillez.eu/images/discord/teaicon.png',
							reason: 'Webhook required to send log messages'
						})
							.then(hook => {
								console.debug(`✅ A new webhook '${webHookName}' has been created in the #${logChannel.name} channel.`);

								hook.send(embedMessage)
									.catch(error => console.error(`teaBot.js:2 sendEmbedLog() Error to send webhook message ${error}`));
							})
							.catch(error => console.error(`teaBot.js:3 sendEmbedLog() Error to create a webhook ${error}`));
					} else {
						existingHook.send(embedMessage)
							.catch(error => console.error(`teaBot.js:2 sendEmbedLog() Error to send webhook message ${error}`));
					}
				})
				.catch(error => console.error(`teaBot.js:4 sendEmbedLog() Error to fetch webhooks for #${logChannel.name} channel ${error}`));
		}
	},

	removeUserLastMessage: function (Member, details) {
		if (!Member.lastMessage) return;
		Member.lastMessage.channel.messages.fetch(Member.lastMessage.id)
			.then(MemberLastMessage => {
				if (MemberLastMessage.deletable) MemberLastMessage.delete({ timeout: 2000 })
					.catch(error => console.error(`teaBot.js:1 removeUserLastMessage() ${details} ${error}`));
			})
			.catch(error => console.error(`teaBot.js:2 removeUserLastMessage() ${details} ${error}`));
	}
}