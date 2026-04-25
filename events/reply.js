require('dotenv').config();
const language = process.env.LANGUAGE;
const dictionary = require('../config/dictionary.json');

const { createConnection, getReply, endConnection } = require('../drivers/characterAIManagement.js');
const { updateConfig, restartBot } = require('../drivers/utils.js');
const { startCharacterAudioPlayback, stopCharacterAudioPlayback } = require('../drivers/voiceConnection.js');
const { createAIVoiceConnection } = require('../drivers/characterAIManagement.js');

function hasImageUrl(url) {
	const imageExtensions = [".png", ".jpg", ".jpeg", ".gif", ".webp"];
	return imageExtensions.some(ext => url.toLowerCase().split('?')[0].endsWith(ext));
}

function parseArgs(content) {
	return content.match(/"[^"]+"|'[^']+'|\S+/g)?.map(arg => arg.replace(/^["']|["']$/g, '')) || [];
}

function getAllowedCommandUserIds() {
	return (process.env.ALLOWED_USER_IDS || '')
		.split(',')
		.map(id => id.trim())
		.filter(Boolean);
}

function canRunCommand(message, client) {
	if (message.author.id === client.user.id) return true;
	return getAllowedCommandUserIds().includes(message.author.id);
}

async function handleCommand(message, client) {
	const prefix = process.env.COMMAND_PREFIX || '!';
	if (!message.content.startsWith(prefix)) return false;
	if (!canRunCommand(message, client)) return true;

	const [commandName, ...args] = parseArgs(message.content.slice(prefix.length).trim());
	const command = commandName?.toLowerCase();

	switch (command) {
		case 'test':
			await message.reply(`${dictionary[language].interactions.salute} ${message.author.globalName || message.author.username}`);
			return true;
		case 'mode':
			if (!['text', 'tts'].includes(args[0])) {
				await message.reply(dictionary[language].interactions.errors.invalidMode);
				return true;
			}

			global.messageMode = args[0];
			await message.reply(args[0] === 'text' ? dictionary[language].interactions.textMode : dictionary[language].interactions.ttsMode);
			return true;
		case 'say': {
			const channelId = args.shift()?.replace(/[<#>]/g, '');
			const text = args.join(' ');
			const channel = channelId ? await client.channels.fetch(channelId).catch(() => null) : message.channel;

			if (!channel || !text) {
				await message.reply(`Usage: ${prefix}say [#channel|channel_id] message`);
				return true;
			}

			await channel.send(text);
			return true;
		}
		case 'greeting': {
			const enabled = ['on', 'true', 'enable', 'enabled'].includes((args[0] || '').toLowerCase());
			const disabled = ['off', 'false', 'disable', 'disabled'].includes((args[0] || '').toLowerCase());

			if (!enabled && !disabled) {
				await message.reply(`Usage: ${prefix}greeting on [#channel|channel_id] [role_id] OR ${prefix}greeting off`);
				return true;
			}

			if (enabled) {
				const channelId = (args[1] || message.channel.id).replace(/[<#>]/g, '');
				const roleId = (args[2] || '').replace(/[<@&>]/g, '');
				await updateConfig(true, 'isGreetingEnabled');
				await updateConfig(channelId, 'greetingChannelId');
				await updateConfig(roleId, 'greetingRoleId');
			} else {
				await updateConfig(false, 'isGreetingEnabled');
				await updateConfig('', 'greetingChannelId');
				await updateConfig('', 'greetingRoleId');
			}

			await message.reply('Greeting settings updated.');
			return true;
		}
		case 'join':
			if (message.member?.voice?.channelId) {
				if (global.isVoiceChat == false) {
					await message.reply(dictionary[language].interactions.join);
					await createAIVoiceConnection();
					await startCharacterAudioPlayback(message);
				} else {
					await message.reply(dictionary[language].interactions.errors.alreadyInVoiceChannel);
				}
			} else {
				await message.reply(dictionary[language].interactions.errors.notConnectedToVoiceChannel);
			}
			return true;
		case 'leave':
			if (global.isVoiceChat == true) {
				await stopCharacterAudioPlayback();
				await message.reply(dictionary[language].interactions.leave);
				global.isVoiceChat = false;
				restartBot();
			} else {
				await message.reply(dictionary[language].interactions.errors.leavingNoChannel);
			}
			return true;
		default:
			return false;
	}
}

module.exports = {
	name: 'messageCreate',
	once: false,
	async execute(message, client) {
		if (!message.author || message.author.bot) return false;
		if (await handleCommand(message, client)) return true;

		if (process.env.AUTO_REPLY_ON_MENTION === 'false') return false;

		if (message.author.id !== client.user.id && message.mentions.users.has(client.user.id)) {
			// If the bot is currently in a voice channel, it cannot reply
			if (global.isVoiceChat == true) {
				await message.reply(dictionary[language].interactions.errors.cannotReplyWhileInVoiceChannel);
			} else {
				const botReply = await message.reply(dictionary[language].interactions.typing);
				let connection = await createConnection();

				// If connection is successful, get the reply
				if (connection === "OK") {

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
						if (embed.image?.url) images.push(embed.image.url);
						if (embed.thumbnail?.url) images.push(embed.thumbnail.url);
					});

					// URLs
					const urls = message.content.match(/\bhttps?:\/\/\S+/gi) || [];
					urls.forEach(url => {
						if (hasImageUrl(url)) {
							images.push(url);
						}
					});

					//Remove duplicates
					const uniqueImages = [...new Set(images)];

					// Character.AI only supports up to one image per message
					if (uniqueImages.length > 1) {
						await botReply.edit(dictionary[language].interactions.errors.moreThanOneImage);
						await endConnection();
						return true;
					}

					await getReply(botReply, message, uniqueImages[0]);
				} else {
					await botReply.edit(dictionary[language].interactions.errors.initializeError);
				}
				await endConnection();
			}
		}

	}
};
