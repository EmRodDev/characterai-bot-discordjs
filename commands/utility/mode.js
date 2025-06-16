require('dotenv').config();
const language = process.env.LANGUAGE;
const dictionary = require('../../config/dictionary.json');

const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mode')
        .setDescription(dictionary[language].commandDescriptions.mode)
        .addStringOption(option => 
            option.setName('option')
            .setDescription(dictionary[language].commandDescriptions.mode_option)
            .setRequired(true)
            .addChoices(
                {name: 'text', value: 'text'},
                {name: 'TTS', value: 'tts'}
            )
        ),
    async execute(interaction) {
        switch(await interaction.options.get('option').value){
            case 'text':
                await interaction.reply(dictionary[language].interactions.textMode);
                global.messageMode = 'text';
                break;
            case 'tts':
                await interaction.reply(dictionary[language].interactions.ttsMode);
                global.messageMode = 'tts';
                break;
            default:
                await interaction.reply(dictionary[language].interactions.errors.invalidMode);
                break;
        }
    },
};