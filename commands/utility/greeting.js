require('dotenv').config();
const language = process.env.LANGUAGE;
const dictionary = require('../../config/dictionary.json');

const {SlashCommandBuilder, ChannelType} = require('discord.js');
const {updateConfig} = require('../../drivers/utils.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('greeting')
		.setDescription(dictionary[language].commandDescriptions.greeting)
        .addBooleanOption(option =>
			option.setName('enable')
				.setDescription(dictionary[language].commandDescriptions.greeting_enable)
				.setRequired(true)
		)
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription(dictionary[language].commandDescriptions.greeting_channel)
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(false)
        )
        .addRoleOption(option =>
            option.setName('role')
                .setDescription(dictionary[language].commandDescriptions.greeting_role)
                .setRequired(false)
        ),
	async execute(interaction) {
        const enableGreeting = interaction.options.getBoolean('enable');
        const greetingChannel = interaction.options.getChannel('channel');
        const greetingRole = interaction.options.getRole('role');

        if(enableGreeting){
            if(!greetingChannel){
                return interaction.reply({ content: dictionary[language].interactions.errors.missingChannel, ephemeral: true });
            }
            await updateConfig(true,'isGreetingEnabled')

            if(greetingRole){
                await updateConfig(greetingRole.id,'greetingRoleId');
            }

            await updateConfig(greetingChannel.id,'greetingChannelId');
        }else{
            await updateConfig(false,'isGreetingEnabled');
            await updateConfig('','greetingChannelId');
            await updateConfig('','greetingRoleId');
        }

        return interaction.reply({ content: 'Greeting settings updated.', ephemeral: true });
	},

}