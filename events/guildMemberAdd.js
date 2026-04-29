require('dotenv').config();
const language = process.env.LANGUAGE;
const dictionary = require('../config/dictionary.json');
const { readConfig } = require('../drivers/utils.js');
const { userGreetedRecently, updateUserGreeted, saveLastMessage } = require('../drivers/greetingSystem.js');

function memberCanViewChannel(channel, member) {
    return Boolean(channel?.permissionsFor(member)?.has('VIEW_CHANNEL'));
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
    name: 'guildMemberAdd',
    async execute(newMember, client) {
        /* GREETING LOGIC ON NEW USER JOIN */

		// Check if greeting feature is enabled and role ID is set
		const [isGreetingEnabled, greetingChannelId, greetingRoleId] = [await readConfig("isGreetingEnabled"),await readConfig("greetingChannelId"), await readConfig("greetingRoleId")];
		
		if(!isGreetingEnabled || !greetingChannelId) return;
        if(greetingRoleId != "" && !newMember.roles.cache.has(greetingRoleId)) return;
        if(userGreetedRecently(newMember.id)) return;

        // Choose a random greeting template
        const greetingChannel = client.channels.cache.get(greetingChannelId) || await client.channels.fetch(greetingChannelId);
        if(!memberCanViewChannel(greetingChannel, newMember)) return;

        const greetingsArray = dictionary[language].interactions.greetings;

        // Replace the {USER} with the user ID
        const template = greetingsArray[Math.floor(Math.random() * greetingsArray.length)];
        const greetingMessage = template.replace('{USER}', `<@${newMember.id}>`);

        await sleep(process.env.WAIT_FOR_GREETING ?? 10000);
        
        // Check if user is still on the server after the delay
        const memberStillInGuild = await newMember.guild.members.fetch(newMember.id).catch(() => null);
        if (!memberStillInGuild) {
            // User has left, skip greeting and let the ban logic handle it
            return;
        }
        
        const sentMessage = await greetingChannel.send(greetingMessage);
        const messageId = sentMessage?.id || greetingChannel.lastMessageId;

        updateUserGreeted(newMember.id);
        if (!saveLastMessage(newMember.id, messageId)) {
            console.warn(`Could not save greeting message id for user ${newMember.id}.`);
        }
    },
};
