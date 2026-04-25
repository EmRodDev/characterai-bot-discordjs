const { client: discordClient } = require('../drivers/clientSetup.js');
const { stopCharacterAudioPlayback } = require('../drivers/voiceConnection.js');
const { restartBot } = require('../drivers/utils.js');

module.exports = {
	name: 'voiceStateUpdate',
	async execute(oldState, newState) {
		// If someone leaves a channel (or switches), check the old channel
		const oldChannel = oldState.channel;
		if (oldChannel) {
			const members = oldChannel.members.filter(member => member.id !== discordClient.user.id);
			const selfMember = oldChannel.members.find(member => member.id === discordClient.user.id);

			if (selfMember && members.size === 0) {
				// Bot is alone, leave the voice channel
				await stopCharacterAudioPlayback();
				global.isVoiceChat = false;
				restartBot();

			}

		}
	},

};
