require('dotenv').config();
const { Events } = require('discord.js');

const language = process.env.LANGUAGE;
const dictionary = require('../config/dictionary.json');
const { readConfig } = require('../drivers/utils.js');
const {userGreetedRecently,updateUserGreeted, saveLastMessage} = require('../drivers/greetingSystem.js');


module.exports = {
    name: Events.GuildMemberUpdate,
    async execute(oldMember, newMember) {

        /* GREETING LOGIC ON ROLE UPDATE */
        const [isGreetingEnabled, greetingChannelId, greetingRoleId] = [await readConfig("isGreetingEnabled"), await readConfig("greetingChannelId"), await readConfig("greetingRoleId")];

        // Check if greeting feature is enabled and role ID is set
        if (!isGreetingEnabled || greetingRoleId == "") return;

        // Detect added roles or removed roles
        const oldRoles = oldMember.roles.cache,
            newRoles = newMember.roles.cache;

        const oldHas = oldRoles.has(greetingRoleId),
            newHas = newRoles.has(greetingRoleId);

        // Check if removed or added
        if (oldHas && !newHas) {
            // Role has been removed (Not doing anything for now)

        } else if (!oldHas && newHas) {

            if(userGreetedRecently(newMember.id)) return;

            updateUserGreeted(newMember.id);

            // Choose a random greeting template
            const greetingChannel = await newMember.client.channels.fetch(greetingChannelId);
            const greetingsArray = dictionary[language].interactions.greetings;

            // Replace the {USER} with the user ID
            const template = greetingsArray[Math.floor(Math.random() * greetingsArray.length)];
            const greetingMessage = template.replace('{USER}', `<@${newMember.id}>`);

            const sentMessage = await greetingChannel.send(greetingMessage);
            
            saveLastMessage(newMember.id, sentMessage.id);
        }
    },
};
