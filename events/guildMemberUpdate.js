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
    name: 'guildMemberUpdate',
    async execute(oldMember, newMember) {

        /* GREETING LOGIC ON ROLE UPDATE */
        const [isGreetingEnabled, greetingChannelId, greetingRoleId] = [await readConfig("isGreetingEnabled"), await readConfig("greetingChannelId"), await readConfig("greetingRoleId")];

        // Check if greeting feature is enabled and role ID is set
        if (!isGreetingEnabled || !greetingChannelId) return;

        // Detect added roles or removed roles
        const oldRoles = oldMember.roles.cache,
            newRoles = newMember.roles.cache;

        const greetingChannel = await newMember.client.channels.fetch(greetingChannelId);
        const oldCanView = memberCanViewChannel(greetingChannel, oldMember);
        const newCanView = memberCanViewChannel(greetingChannel, newMember);

        if (!newCanView) return;

        if (greetingRoleId != "") {
            const oldHas = oldRoles.has(greetingRoleId),
                newHas = newRoles.has(greetingRoleId);

            if (oldHas || !newHas) return;
        } else if (oldCanView) {
            return;
        }

        if (userGreetedRecently(newMember.id)) return;

        // Choose a random greeting template
        const greetingsArray = dictionary[language].interactions.greetings;

        // Replace the {USER} with the user ID
        const template = greetingsArray[Math.floor(Math.random() * greetingsArray.length)];
        const greetingMessage = template.replace('{USER}', `<@${newMember.id}>`);

        await sleep(5000);
        const sentMessage = await greetingChannel.send(greetingMessage);
        const messageId = sentMessage?.id || greetingChannel.lastMessageId;

        updateUserGreeted(newMember.id);
        if (!saveLastMessage(newMember.id, messageId)) {
            console.warn(`Could not save greeting message id for user ${newMember.id}.`);
        }
    },
};
