module.exports = {
	name: 'ready',
	once: true,
	execute(client) {
		global.isVoiceChat = false;
		global.messageMode = process.env.DEFAULT_MESSAGE_MODE || 'text';
		console.log(`Ready! Logged in as ${client.user.tag}`);
		console.log(`Prefix commands enabled with "${process.env.COMMAND_PREFIX || '!'}"`);
	},
};
