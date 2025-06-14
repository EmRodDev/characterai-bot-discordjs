
const {Main} = require('./drivers/clientSetup.js');

const app = new Main();
app.loadEvents();
app.loadCommands();

(async () => {
await app.deployCommands();
})();

app.clientLogin();
