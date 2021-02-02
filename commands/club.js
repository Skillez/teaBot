const config = require("../bot-settings.json");
const { logger } = require("../functions/logger");
const fs = require('fs');
const { botReply, messageRemoverWithReact, TEAlogo, Discord } = require("../teaBot");

module.exports.help = {
  name: "club",
  description: "Show information about the club.",
  type: "public",
  usage: `ℹ️ Format: **${config.botPrefix}club clubName**\n\nℹ️ Example(s):\n${config.botPrefix}club laez\n${config.botPrefix}club henort`
};

module.exports.run = async (bot, message, args) => {
  fs.readFile('./cache/certification.json', 'utf8', (error, data) => {
    if (error) {
      logger('error', 'club.js:1 () Load certification file', error);
      return botReply('Error to parse data, try again later.', message, 5000);
    }

    const newData = JSON.parse(data);
    if (!args[0] || args[0].length < 3) return botReply(`Wrong command format, type **${config.botPrefix}help ${module.exports.help.name}** to see usage and examples!`, message, 10000);

    const searchValue = message.content.slice(config.botPrefix.length + module.exports.help.name.length).trim().toLowerCase();
    return findTheClub(newData, searchValue)
      .then(club => {
        const { guildDescription, guildName, guildRepresentative, guildRequirements } = club;
        let { guildDiscordID, guildJoinworld, guildDiscordLink } = club;

        const embed_club_details = new Discord.MessageEmbed()
          .setColor('#f7f7f7')
          .setAuthor(`Club Details`, TEAlogo)
          .setTitle(`Club Name: \`${guildName}\``)
          .setDescription(`${guildDescription}\n‏‏‎ ‎‎`)
          .addFields(
            { name: 'Discord Server ID(s)', value: guildDiscordID = guildDiscordID || 'Data is not provided', inline: false },
            { name: 'in-game club world', value: guildJoinworld = (guildJoinworld ? `\`/joinworld ${guildJoinworld?.toLowerCase()}\`` : 'Data is not provided'), inline: false },
            { name: 'Requirement(s)', value: guildRequirements, inline: false },
            { name: 'Discord Invite', value: guildDiscordLink = guildDiscordLink || 'Data is not provided', inline: false },
            { name: 'Representative', value: guildRepresentative, inline: false },
          )
          .setThumbnail(TEAlogo)
          .setTimestamp()
        botReply(embed_club_details, message)
          .then(msg => messageRemoverWithReact(msg, message.author));
      })
      .catch(error => {
        switch (error) {
          case 'no_club': { return botReply('❌ Club is not found in the database.', message, 5000); }
          case 'invalid_regex': { return botReply('❌ Invalid club name, make sure to type only alphanumeric characters!', message, 10000); }
          default: {
            logger('error', 'club.js:2 () Check for club', error);
            return botReply('❌ Error with the command, try again later.', message, 5000);
          }
        }
      });
  });

  function findTheClub(object, word) {
    // console.log(config.certification.hiddenServers[1].guildName)





    return new Promise((resolve, reject) => {
      if (!word.match(/^[a-zA-Z0-9 ]+$/)) return reject('invalid_regex');
      if (word === 'henort') word = 'the  north';
      const regex = new RegExp(`(${word})`, 'gi');

      if (object.find(element => element.guildName?.toLowerCase() === word))
        return resolve(object.find(element => element.guildName?.toLowerCase() === word));

      for (const key in object) {
        if (Object.hasOwnProperty.call(object, key)) {
          const element = object[key];

          if (element.guildName.match(regex)) {
            for (const iterator of config.certification.hiddenServers) {
              if (element.guildName === iterator.guildName) return reject('no_club');
            }
            return resolve(element);
          }
        }
      }
      reject('no_club');
    })
  }
}