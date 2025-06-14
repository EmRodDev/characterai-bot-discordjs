require('dotenv').config();
const language = process.env.LANGUAGE;
const dictionary = require('../../config/dictionary.json');
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('test')
		.setDescription(dictionary[language].commandDescriptions.test),
	async execute(interaction) {
		await interaction.reply(`${dictionary[language].interactions.salute} ${interaction.user.tag}`);
	}
}