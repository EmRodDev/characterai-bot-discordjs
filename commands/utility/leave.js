require('dotenv').config();
const language = process.env.LANGUAGE;
const dictionary = require('../../config/dictionary.json');

const { SlashCommandBuilder } = require('discord.js');
const { stopCharacterAudioPlayback } = require('../../drivers/voiceConnection');
const { restartBot } = require('../../drivers/utils');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leave')
        .setDescription(dictionary[language].commandDescriptions.leave),
    async execute(interaction) {
        if(global.isVoiceChat == true){
            await stopCharacterAudioPlayback();
            await interaction.reply(dictionary[language].interactions.leave);
            global.isVoiceChat = false;

            //Restarts the bot since the client.character.voice.connect() doesn't work properly when trying to connect the bot to vc a second time
            restartBot();
        }

    },
};