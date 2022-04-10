import * as mongoDB from "mongodb";
import credentials from './credentials.json';

export const collections: { vtubers?: mongoDB.Collection } = {};

export async function connectToDatabase () {
    const client: mongoDB.MongoClient = new mongoDB.MongoClient(credentials.mongoDB.dbConnString);
    await client.connect();
    const db: mongoDB.Db = client.db(credentials.mongoDB.dbName);
    const fanartsCollection: mongoDB.Collection = db.collection(credentials.mongoDB.dbCollection);
    collections.vtubers = fanartsCollection;

    console.log(`Successfully connected to database: ${db.databaseName} and collection: ${fanartsCollection.collectionName}`)
}