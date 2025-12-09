const { Events } = require('discord.js');
const { readConfig } = require('../drivers/utils.js');
const {getLastMessage,clearUser} = require('../drivers/greetingSystem.js');

module.exports = {
    name: Events.GuildMemberRemove,
    async execute(member) {
        const greetingChannelId = await readConfig("greetingChannelId");
        if (!greetingChannelId) return;

        const messageId = getLastMessage(member.id);
        if (!messageId) return;

        try {
            const channel = await member.client.channels.fetch(greetingChannelId);
            if (channel && channel.isTextBased()) {
                const msg = await channel.messages.fetch(messageId).catch(() => null);
                if (msg) await msg.delete().catch(() => {});
            }
        } catch (_) {}

        // Remove files
        clearUser(member.id);
    },
};
