const { Events } = require('discord.js');

module.exports = {
	name: Events.ClientReady,
	once: true,
	execute(client) {
		global.isVoiceChat = false;
		global.messageMode = 'text';
		console.log(`Ready! Logged in as ${client.user.tag}`);
	},
};