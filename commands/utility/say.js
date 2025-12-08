require('dotenv').config();
const language = process.env.LANGUAGE;
const dictionary = require('../../config/dictionary.json');

const { SlashCommandBuilder, ChannelType } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('say')
        .setDescription(dictionary[language].commandDescriptions.say)
        .addChannelOption(
            option =>
                option.setName('channel')
                    .setDescription(dictionary[language].commandDescriptions.say_channel)
                    .addChannelTypes(ChannelType.GuildText)
                    .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('message')
                .setDescription(dictionary[language].commandDescriptions.say_message)
                .setRequired(true)
        ),
    async execute(interaction) {
        const channel = interaction.options.getChannel('channel');
        const message = await interaction.options.getString('message');
        await channel.send(message);

        
        await interaction.reply({ content: '👍', ephemeral: true });

    },
};