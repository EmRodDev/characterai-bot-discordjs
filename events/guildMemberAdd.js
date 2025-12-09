require('dotenv').config();
const language = process.env.LANGUAGE;
const dictionary = require('../config/dictionary.json');
const { readConfig } = require('../drivers/utils.js');

const { Events } = require('discord.js');

module.exports = {
    name: Events.GuildMemberAdd,
    async execute(oldMember, newMember) {
        /* GREETING LOGIC ON NEW USER JOIN */

		// Check if greeting feature is enabled and role ID is set
		const [isGreetingEnabled, greetingChannelId, greetingRoleId] = [await readConfig("isGreetingEnabled"),await readConfig("greetingChannelId"), await readConfig("greetingRoleId")];
		
		if(!isGreetingEnabled || greetingRoleId != "") return;

        // Choose a random greeting template
        const greetingChannel = await client.channels.cache.get(greetingChannelId);
        const greetingsArray = dictionary[language].interactions.greetings;

        // Replace the {USER} with the user ID
        const template = greetingsArray[Math.floor(Math.random() * greetingsArray.length)];
        const greetingMessage = template.replace('{USER}', `<@${newMember.id}>`);

        await greetingChannel.send(greetingMessage);
    },
};
