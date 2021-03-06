import SteamHandler from './steam';
import Saucenao from './saucenao';
import CustomClient from './botSetup';
import ImageGatherer from './imageHandler';
import express, { Request, Response } from 'express';
import { connectToDatabase, getFanartsByAuthor, getFanartWithDates, getUserList } from './services';
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

app.get('/Fanarts', async (req: Request, res: Response) => {
    console.log('/Fanarts', req.query);
    const fanartList = await getFanartWithDates({startDate: new Date(req.query.startDate as string), endDate: new Date(req.query.endDate as string), tags: req.query.tags as string[]});
    res.send(fanartList);
})

app.get('/UsersCompletion', async(req: Request, res: Response) => {
    console.log('/UsersCompletion', req.query);
    const userList = await getUserList(req.query.username as string);
    res.send(userList);
})

app.get('/User', async (req: Request, res: Response) => {
    console.log('/User', req.query);
    const userData = await commandClient.imagesHandler.GetUserData(req.query.username as string);
    if (userData.error) {
        res.send({
            userData: null,
            fanartList: null,
            error: {
                error: true,
                title: 'User not found'
            }
        })
        return;
    }
    console.log(userData);
    const fanartList = await getFanartsByAuthor(userData.data.username);
    if (fanartList.length <= 0) {
        res.send({
            userData: null,
            fanartList: null,
            error: {
                error: true,
                title: 'User not found'
            }
        })
        return;
    }
    res.send({
        userData: userData.data,
        fanartList: fanartList,
        error: {
            error: false,
            title: ''
        }
    });
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