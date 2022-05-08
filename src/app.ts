import SteamHandler from './steam';
import Saucenao from './saucenao';
import CustomClient from './botSetup';
import ImageGatherer from './scrapping';
import express, { Request, Response } from 'express';
import { connectToDatabase, getFanartWithDates } from './services';
import cors, { CorsOptions } from 'cors';

const app = express();

const opt: CorsOptions = {
    origin: 'http://localhost:3000',
    methods: ["GET", "POST"]
}

app.use('*', function(req, res, next) {
    //replace localhost:8080 to the ip address:port of your server
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET");
    res.header('Access-Control-Allow-Headers', 'application/json');
    res.header('Access-Control-Allow-Credentials', 'true');
    next(); 
    });
    
//enable pre-flight
app.options('*', cors());

app.get('/getFanarts', async (req: Request, res: Response) => {
    console.log('/getFanartsCalled', req.params);
    const data = await getFanartWithDates(req.body);
    res.send(data);
})

const steamHandler = new SteamHandler(process.env.STEAM);
const saucenaoHandler = new Saucenao(process.env.SAUCENAO);
const imagesGather = new ImageGatherer(process.env.TWITTER_BEARER_TOKEN);
const commandClient = new CustomClient(process.env.DISCORD, "!", steamHandler, saucenaoHandler, imagesGather);

(async () => {
    await connectToDatabase();
    const client = await commandClient.run();
    console.log(`Client has loaded with a shard count of ${client.shardCount}`);
    app.listen(process.env.PORT, () => {
        console.log(`Server is listening on ${process.env.PORT}`);
    })
})();