require('dotenv').config();

const fs = require('node:fs');
const path = require('node:path');
const { Client } = require('discord.js-selfbot-v13');

const client = new Client({
    checkUpdate: false
});

class Main {
    loadEvents() {
        const eventsPath = path.join(process.cwd(), 'events');
        const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

        for (const file of eventFiles) {
            const filePath = path.join(eventsPath, file);
            const event = require(filePath);
            if (event.once) {
                client.once(event.name, (...args) => event.execute(...args, client));
            } else {
                client.on(event.name, (...args) => event.execute(...args, client));
            }
        }

    }

    clientLogin(){
        const token = process.env.DISCORD_TOKEN;

        if (!token) {
            throw new Error('Missing DISCORD_TOKEN in .env');
        }

        client.login(token);
    }
}

module.exports = {Main,client}
