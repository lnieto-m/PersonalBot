import * as mongoDB from "mongodb";

export const collections: { vtubers?: mongoDB.Collection } = {};

export async function connectToDatabase () {
    const client: mongoDB.MongoClient = new mongoDB.MongoClient(process.env.DB_CONN_STRING);
    await client.connect();
    const db: mongoDB.Db = client.db(process.env.DB_NAME);
    const fanartsCollection: mongoDB.Collection = db.collection(process.env.DB_COLLECTION_NAME);
    collections.vtubers = fanartsCollection;

    console.log(`Successfully connected to database: ${db.databaseName} and collection: ${fanartsCollection.collectionName}`)
}