import createNewBot from './botSetup';
import SteamHandler from './steam';
import credentials from './credentials.json';
import Saucenao from './saucenao';

const steamHandler = new SteamHandler(credentials.steam);
const saucenaoHandler = new Saucenao(credentials.sauceNAO);
const commandClient = createNewBot(credentials.discord, "!", steamHandler, saucenaoHandler);

(async () => {
    const client = await commandClient.run();
    console.log(`Client has loaded with a shard count of ${client.shardCount}`);
})();