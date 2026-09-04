const { Events, MessageFlags } = require('discord.js');

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		if (!interaction.isChatInputCommand()) return;

		const command = interaction.client.commands.get(interaction.commandName);

		if (!command) {
            return;
		}

		try {
			await command.execute(interaction);
		} catch (error) {
			// Another running copy of this bot may have already acknowledged the
			// interaction. Discord will reject every further response for that ID.
			if (error?.code === 40060 || error?.code === 10062) {
				console.warn(`Ignoring expired/already acknowledged interaction ${interaction.id} (Discord ${error.code}).`);
				return;
			}

			console.error(error);
			try {
				if (interaction.replied || interaction.deferred) {
					await interaction.followUp({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
				} else {
					await interaction.reply({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
				}
			} catch (responseError) {
				if (responseError?.code === 40060 || responseError?.code === 10062) {
					console.warn(`Unable to respond to expired interaction ${interaction.id} (Discord ${responseError.code}).`);
					return;
				}
				// A stale interaction cannot be acknowledged; log it without crashing the bot.
				console.error('Unable to send interaction error response:', responseError);
			}
		}
	},
};
