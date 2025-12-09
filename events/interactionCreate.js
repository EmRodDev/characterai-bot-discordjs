const { Events, MessageFlags } = require('discord.js');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (!interaction.isChatInputCommand()) return;

        const command = interaction.client.commands.get(interaction.commandName);
        if (!command) return;

        const timeout = setTimeout(() => {
            if (!interaction.deferred && !interaction.replied) {
                interaction.deferReply().catch(() => {});
            }
        }, 2500);

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(`Error in command: ${interaction.commandName}`);
            console.error(error.stack || error);

            if (interaction.deferred) {
                await interaction.editReply({
                    content: 'There was an error while executing this command.',
                }).catch(() => {});
            } else if (!interaction.replied) {
                await interaction.reply({
                    content: 'There was an error while executing this command.',
                    flags: MessageFlags.Ephemeral
                }).catch(() => {});
            } else {
                await interaction.followUp({
                    content: 'There was an error while executing this command.',
                    flags: MessageFlags.Ephemeral
                }).catch(() => {});
            }
        } finally {
            clearTimeout(timeout);
        }
    },
};
