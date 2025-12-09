require('dotenv').config();
const language = process.env.LANGUAGE;
const dictionary = require('../config/dictionary.json');

const { Events } = require('discord.js');
const { createConnection, getReply, endConnection } = require('../drivers/characterAIManagement.js');

module.exports = {
	name: Events.MessageCreate,
	once: false,
	async execute(message) {
		if (message.author.bot) return false;

		if (message.mentions.users.has(process.env.CLIENT_ID)) {
			// If the bot is currently in a voice channel, it cannot reply
			if (global.isVoiceChat == true) {
				await message.reply(dictionary[language].interactions.errors.cannotReplyWhileInVoiceChannel);
			} else {
				const botReply = await message.reply(dictionary[language].interactions.typing);
				let connection = await createConnection();

				// If connection is successful, get the reply
				if (connection = "OK") {

					/* Controls for images, attachments or URLs */
					const images = [];

					// Attachments
					message.attachments.forEach(att => {
						if (att.contentType?.startsWith("image/")) {
							images.push(att.url);
						}else{
							return message.reply(dictionary[language].interactions.errors.unsupportedAttachmentType);
						}
					});

					// Embeds
					message.embeds.forEach(embed => {
						if (embed.data?.image?.url) images.push(embed.data.image.url);
						if (embed.data?.thumbnail?.url) images.push(embed.data.thumbnail.url);
					});

					// URLs
					const imageExtensions = [".png", ".jpg", ".jpeg", ".gif", ".webp"];
					const urls = message.content.match(/\bhttps?:\/\/\S+/gi) || [];
					urls.forEach(url => {
						if (imageExtensions.some(ext => url.toLowerCase().endsWith(ext))) {
							images.push(url);
						}
					});

					//Remove duplicates
					const uniqueImages = [...new Set(images)];

					// Character.AI only supports up to one image per message
					if (uniqueImages.length > 1) return await message.reply(dictionary[language].interactions.errors.moreThanOneImage);



					await getReply(botReply, message, uniqueImages[0]);
				

				} else {
					await message.editReply(dictionary[language].interactions.errors.initializeError);
				}
				await endConnection();
			}
		}

	}
};