import SteamHandler from './steam';
import Saucenao from './saucenao';
import CustomClient from './botSetup';
import ImageGatherer from './scrapping';
import { connectToDatabase } from './services';

const steamHandler = new SteamHandler(process.env.STEAM);
const saucenaoHandler = new Saucenao(process.env.SAUCENAO);
const imagesGather = new ImageGatherer(process.env.TWITTER_BEARER_TOKEN);
const commandClient = new CustomClient(process.env.DISCORD, "!", steamHandler, saucenaoHandler, imagesGather);

(async () => {
    await connectToDatabase();
    const client = await commandClient.run();
    console.log(`Client has loaded with a shard count of ${client.shardCount}`);
})();