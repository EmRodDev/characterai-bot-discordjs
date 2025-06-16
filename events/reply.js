require('dotenv').config();
const language = process.env.LANGUAGE;
const dictionary = require('../config/dictionary.json');

const { Events } = require('discord.js');
const {createConnection,getReply,endConnection} = require('../drivers/characterAIManagement.js');

module.exports = {
	name: Events.MessageCreate,
	once: false,
	async execute(message) {
		if (message.author.bot) return false;

		if (message.mentions.users.has(process.env.CLIENT_ID)) {
			if(global.isVoiceChat == true){
				await message.reply(dictionary[language].interactions.errors.cannotReplyWhileInVoiceChannel);
			}else{
				const botReply = await message.reply(dictionary[language].interactions.typing);
				let connection = await createConnection();

				if(connection = "OK"){
					await getReply(botReply,message);
				}else{
					await message.editReply(dictionary[language].interactions.errors.initializeError);
				}
				await endConnection();
			}
		}

	}
};