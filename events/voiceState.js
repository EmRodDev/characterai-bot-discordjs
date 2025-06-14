const { Events } = require('discord.js');
const { client: discordClient } = require('../drivers/clientSetup.js');
const { stopCharacterAudioPlayback } = require('../drivers/voiceConnection.js');

module.exports = {
	name: Events.VoiceStateUpdate,
	async execute(oldState, newState) {
		// If someone leaves a channel (or switches), check the old channel
		const oldChannel = oldState.channel;
		if (oldChannel) {
			const members = await oldChannel.members.filter(member => !member.user.bot);
			const botMember = await oldChannel.members.find(member => member.user.bot && member.id === discordClient.user.id);

			if (botMember && members.size === 0) {
				// Bot is alone, leave the voice channel
				stopCharacterAudioPlayback();
				global.isVoiceChat = false;

			}

		}
	},

};