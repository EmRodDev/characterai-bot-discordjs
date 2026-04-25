const { readConfig } = require('../drivers/utils.js');
const {getLastMessage,isLastMessageRecent,clearUser} = require('../drivers/greetingSystem.js');

async function deleteGreetingMessage(client, channelId, messageId) {
    const channel = client.channels.cache.get(channelId) || await client.channels.fetch(channelId).catch(() => null);

    if (channel?.messages?.delete) {
        await channel.messages.delete(messageId);
        return true;
    }

    await client.api.channels(channelId).messages(messageId).delete();
    return true;
}

module.exports = {
    name: 'guildMemberRemove',
    async execute(member) {
        const greetingChannelId = await readConfig("greetingChannelId");
        const messageId = getLastMessage(member.id)?.trim();

        if (!greetingChannelId) {
            clearUser(member.id);
            return;
        }

        if (!messageId) {
            clearUser(member.id);
            return;
        }

        if (isLastMessageRecent(member.id)) {
            try {
                await deleteGreetingMessage(member.client, greetingChannelId, messageId);
            } catch (error) {
                console.warn(`Could not delete greeting message ${messageId}: ${error.message}`);
            }
        }

        // Remove files
        clearUser(member.id);
    },
};
