import createNewBot from './botSetup';
import SteamHandler from './steam';
import credentials from './credentials.json';
import Saucenao from './saucenao';
import CustomClient from './botSetup';
import ImageGatherer from './scrapping';
import { connectToDatabase } from './services';

const steamHandler = new SteamHandler(credentials.steam);
const saucenaoHandler = new Saucenao(credentials.sauceNAO);
const imagesGather = new ImageGatherer(credentials.TwitterBearerTokenV2);
const commandClient = new CustomClient(credentials.discord, "!", steamHandler, saucenaoHandler, imagesGather);

(async () => {
    await connectToDatabase();
    const client = await commandClient.run();
    console.log(`Client has loaded with a shard count of ${client.shardCount}`);
})();