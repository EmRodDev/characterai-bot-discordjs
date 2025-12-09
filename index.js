
const {Main} = require('./drivers/clientSetup.js');
const {createGreetingDirs,cleanupOldFiles} = require('./drivers/greetingSystem.js');

createGreetingDirs();

const app = new Main();
app.loadEvents();
app.loadCommands();

(async () => {
await app.deployCommands();
})();

app.clientLogin();

setInterval(cleanupOldFiles, 60 * 60 * 1000);

