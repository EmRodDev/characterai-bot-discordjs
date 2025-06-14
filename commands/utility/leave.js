require('dotenv').config();
const language = process.env.LANGUAGE;
const dictionary = require('../../config/dictionary.json');

const { SlashCommandBuilder } = require('discord.js');
const { stopCharacterAudioPlayback } = require('../../drivers/voiceConnection');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leave')
        .setDescription(dictionary[language].commandDescriptions.leave),
    async execute(interaction) {
        if(global.isVoiceChat){
            await stopCharacterAudioPlayback();
            await interaction.reply(dictionary[language].interactions.leave);

            global.isVoiceChat = false;
        }

    },
};