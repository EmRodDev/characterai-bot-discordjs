require('dotenv').config();
const language = process.env.LANGUAGE;
const dictionary = require('../../config/dictionary.json');

const { SlashCommandBuilder} = require('discord.js');
const {createAIVoiceConnection} = require('../../drivers/characterAIManagement.js');
const { startCharacterAudioPlayback } = require('../../drivers/voiceConnection.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('join')
		.setDescription(dictionary[language].commandDescriptions.join),
	async execute(interaction) {
        if(interaction.member.voice.channelId){
            if(global.isVoiceChat == false){
                await interaction.reply(dictionary[language].interactions.join);
                await createAIVoiceConnection();
                await startCharacterAudioPlayback(interaction);
            }
        }else{
            await interaction.reply(dictionary[language].interactions.errors.notConnectedToVoiceChannel);
        }
	},

}