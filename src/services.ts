import * as mongoDB from "mongodb";
import Fanart from "./fanart";

export interface SearchParams {
    startDate: Date;
    endDate: Date;
    tags: string[];
}

export const collections: { vtubers?: mongoDB.Collection } = {};

export async function connectToDatabase () {
    const client: mongoDB.MongoClient = new mongoDB.MongoClient(process.env.DB_CONN_STRING);
    await client.connect();
    const db: mongoDB.Db = client.db(process.env.DB_NAME);
    const fanartsCollection: mongoDB.Collection = db.collection(process.env.DB_COLLECTION_NAME);
    collections.vtubers = fanartsCollection;

    console.log(`Successfully connected to database: ${db.databaseName} and collection: ${fanartsCollection.collectionName}`)
}

export async function getFanartWithDates (params: SearchParams): Promise<Fanart[]> {
    try {
        const Fanarts = (await collections.vtubers.find({
            _id: {
                $gte: mongoDB.ObjectId.createFromTime(params.startDate.getTime() / 1000),
                $lt: mongoDB.ObjectId.createFromTime(params.endDate.getTime() / 1000)
            },
            tags: {
                $in: params.tags
            }
        }).toArray()) as unknown as Fanart[];
        return Fanarts;
    } catch (e) {
        console.error(e);
    }
}