import axios from "axios";
import compressing from 'compressing';
import * as fs from "fs";
import { ObjectId } from "mongodb";
import Path from 'path';
import { ETwitterStreamEvent, MediaObjectV2, TweetStream, TwitterApi, TwitterApiReadOnly, TwitterV2IncludesHelper, UserV2 } from "twitter-api-v2";
import Fanart from "./fanart";
import { collections } from "./services";

export interface SearchData {
    characterName: string;
    characterTags: string[];
}

export interface FileData {
    name: string;
    path: string;
    tgzPath: string;
}

interface TweetData {
    mediaData: MediaObjectV2[];
    userData: UserV2;
    createdAt: string;
}

export const TagList = {
    "#inart" : "Ina",
    "#callillust" : "Calli",
    "#ameliart" : "Ame",
    "#gawrt" : "Gura",
    "#artsofashes" : "Kiara",
    "#irysart" : "Irys",
    "#kronillust" : "Kronii",
    "#drawmei" : "Mumei",
    "#illustraybae" : "Bae",
    "#galaxillust" : "Sana",
    "#finefaunart": "Fauna" ,
}

//(#+[a-zA-Z0-9(_)]{1,})

export default class ImageGatherer {

    private token: string;
    private twitterClient: TwitterApiReadOnly;
    private dataStream: TweetStream; 

    Close(): void {
        try {
            this.dataStream.close();
        } catch (e) {
            console.error(e);
            console.log(this.dataStream);
        }
    }

    async GetDownloadableArchive(tags: string[], username: string): Promise<FileData> {
        const today = new Date(Date.now());
        const dirPath = `${username}-${today.toDateString()}`;
        console.log("#2 dirPath:", Path.resolve(__dirname, dirPath));
        try {
            fs.mkdirSync(Path.resolve(__dirname, dirPath));
        } catch (error) {
            console.error(error);
        }
        console.log("#3 Tags:", tags);
        
        try {
            const Fanarts = (await collections.vtubers.find({
                _id: {
                    $gt: ObjectId.createFromTime(Date.now() / 1000 - 24*60*60)
                },
                tags: {
                    $in: tags
                }
            }).toArray()) as unknown as Fanart[];

            console.log("#4 Fanarts:", Fanarts);

            for (const piece of Fanarts) { await this.DownloadImage(piece.url, dirPath); }

            await compressing.tgz.compressDir( Path.resolve(__dirname, dirPath),  Path.resolve(__dirname, `${dirPath}.tgz`));
        } catch (error) {
            console.error(error);
        }

        return {
            name: dirPath,
            path: Path.resolve(__dirname, dirPath),
            tgzPath: Path.resolve(__dirname, `${dirPath}.tgz`)
        };
    }

    async DownloadImage(url: string, dirName: string): Promise<void>{
        const fileName = url.split('/');
        const path = Path.resolve(__dirname, dirName, fileName[fileName.length - 1]);
        const writer = fs.createWriteStream(path);

        const response = await axios.get(url, {
            responseType: 'stream'
        });

        response.data.pipe(writer);

        return new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        })
    }

    async _getTweetData(id: string): Promise<TweetData> {
        const tweet = await this.twitterClient.v2.singleTweet(id, {'media.fields': 'url', 'tweet.fields' : ['author_id', 'created_at'], expansions: ['attachments.media_keys', 'author_id']});
        const mediaData = TwitterV2IncludesHelper.media(tweet);
        const authorData = await this.twitterClient.v2.user(tweet.data.author_id);
        return {
            mediaData: mediaData,
            userData: authorData.data,
            createdAt: tweet.data.created_at
        };
    }

    _parseTags(data: string): string[] {
        const regex = /(#+[a-zA-Z0-9(_)]{1,})/gm;
        let mtch: RegExpExecArray;
        let results: string[] = [];
        while((mtch = regex.exec(data)) !== null) {
            if (mtch.index === regex.lastIndex) { regex.lastIndex++; }
            mtch.forEach((match, groupIndex, data) => {
                if (groupIndex === data.length - 1 && TagList[match.toLowerCase()] !== undefined) {
                    results.push(TagList[match.toLowerCase()]);
                };
                console.log(`Found match, group ${groupIndex}: ${match} --- results: ${results}`);
            })
        }
        return results;
    }

    async _dataToMongoDB(data: TweetData, tags: string[]): Promise<void> {
        let imageList: Fanart[] = [];
        for (const media of data.mediaData) {
            imageList.push(new Fanart(data.userData.username, media.url, data.createdAt, tags));
        }
        try {
            const result = await collections.vtubers.insertMany(imageList)
            result
                ? console.log('Successfully created new fanart entry.')
                : console.log('Failed to create new entries.');
        } catch (error) {
            console.error(error);
        }
    }

    async AddStreamRules(): Promise<void> {
        await this.twitterClient.v2.updateStreamRules({
            delete: {
                ids: ['1512855222695215109']
            }
        })
        const addedRules = await this.twitterClient.v2.updateStreamRules({
            add: [
                {
                    value: '(#gawrt OR #ameliaRT OR #inART OR #callillust OR #artsofashes OR #IRySart OR #illustrayBAE OR #galaxillust OR #drawMEI OR  #FineFaunart OR  #kronillust) has:images -is:retweet -is:quote -is:reply',
                    tag: 'fanarts with medias with no retweets or quotes'}
            ]
        });
        console.log(addedRules);
    }

    async StartMonitoring(): Promise<void> {
        const rules = await this.twitterClient.v2.streamRules({});
        console.log("Applied rules:", rules);
        try {
            this.dataStream = await this.twitterClient.v2.searchStream({'media.fields': 'url'});
        } catch (e) {
            console.error(e);
        }
        this.dataStream.on(
            ETwitterStreamEvent.ConnectionClosed,
            () => console.log("Connection closed")
        );
        this.dataStream.on(
            ETwitterStreamEvent.Data,
            async (eventData) => {
                try {
                    console.log(eventData);
                    const mediaData = await this._getTweetData(eventData.data.id);
                    const tags = this._parseTags(eventData.data.text);
                    console.log('Twitter Data:', eventData, mediaData);
                    this._dataToMongoDB(mediaData, tags);
                } catch (e) {
                    console.error(e);
                }
            }
        );
        this.dataStream.autoReconnect = true;
    }

    async Init(): Promise<void> {
        const twitterClient = new TwitterApi(this.token);
        this.twitterClient = twitterClient.readOnly;
    }

    constructor(twitterToken: string) {
        this.token = twitterToken;
    }
}