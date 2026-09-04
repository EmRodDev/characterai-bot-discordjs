require('dotenv').config();
const language = process.env.LANGUAGE;
const dictionary = require('../../config/dictionary.json');

const { SlashCommandBuilder} = require('discord.js');
const {createAIVoiceConnection} = require('../../drivers/characterAIManagement.js');
const { startCharacterAudioPlayback, stopCharacterAudioPlayback } = require('../../drivers/voiceConnection.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('join')
		.setDescription(dictionary[language].commandDescriptions.join),
	async execute(interaction) {
		// Character.AI setup can take longer than Discord's three-second interaction
		// acknowledgement window, so acknowledge before doing any network work.
		await interaction.deferReply();
        if(interaction.member.voice.channelId){
            if(global.isVoiceChat == false){
                await interaction.editReply(dictionary[language].interactions.join);
                try {
                    await createAIVoiceConnection();
                    await startCharacterAudioPlayback(interaction);
                } catch (error) {
                    console.error('Unable to start voice chat:', error);
                    await stopCharacterAudioPlayback();
                    await interaction.editReply(dictionary[language].interactions.errors.unexpectedError);
                }
            }
            else{
                await interaction.editReply(dictionary[language].interactions.errors.alreadyInVoiceChannel);
            }
        }else{
            await interaction.editReply(dictionary[language].interactions.errors.notConnectedToVoiceChannel);
        }
	},

}
