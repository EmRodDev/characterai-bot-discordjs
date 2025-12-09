const fs = require('fs');
const path = require('path');

const COOLDOWN_MS = 60 * 60 * 1000; // 1 hour
const greetedDir = path.join(__dirname, '..', 'data', 'greeted');
const messagesDir = path.join(__dirname, '..', 'data', 'greetingMessages');

function filePath(dir, userId) {
    return path.join(dir, `${userId}.txt`);
}

module.exports = {


    createGreetingDirs() {
        const dataDirs = ['greeted', 'greetingMessages'].map(d => path.join(__dirname, '..', 'data', d));

        for (const dir of dataDirs) {
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        }
    },

    // Check if user was greeted within last hour
    userGreetedRecently(userId) {
        const fp = filePath(greetedDir, userId);
        if (!fs.existsSync(fp)) return false;

        const stats = fs.statSync(fp);
        return Date.now() - stats.mtimeMs < COOLDOWN_MS;
    },

    // Update greeting cooldown
    updateUserGreeted(userId) {
        const fp = filePath(greetedDir, userId);
        fs.writeFileSync(fp, '');
    },

    // Save the last greeting message ID
    saveLastMessage(userId, messageId) {
        const fp = filePath(messagesDir, userId);
        fs.writeFileSync(fp, messageId);
    },

    // Retrieve last greeting message ID
    getLastMessage(userId) {
        const fp = filePath(messagesDir, userId);
        if (!fs.existsSync(fp)) return null;
        return fs.readFileSync(fp, 'utf8');
    },

    // Delete stored cooldown and message
    clearUser(userId) {
        const cooldownFile = filePath(greetedDir, userId);
        if (fs.existsSync(cooldownFile)) fs.unlinkSync(cooldownFile);

        const messageFile = filePath(messagesDir, userId);
        if (fs.existsSync(messageFile)) fs.unlinkSync(messageFile);
    },
    // Cleanup old files for both folders
    cleanupOldFiles() {
        const now = Date.now();

        for (const dir of [greetedDir, messagesDir]) {
            if (!fs.existsSync(dir)) continue;

            const files = fs.readdirSync(dir);
            for (const file of files) {
                const filePathFull = path.join(dir, file);
                const stats = fs.statSync(filePathFull);

                if (now - stats.mtimeMs > COOLDOWN_MS) {
                    fs.unlinkSync(filePathFull);
                }
            }
        }
    }
}
