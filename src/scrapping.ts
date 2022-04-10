import Pixiv from "pixiv.ts";
import { ETwitterStreamEvent, MediaObjectV2, TweetStream, TwitterApi, TwitterApiReadOnly, TwitterV2IncludesHelper, UserV2 } from "twitter-api-v2";
import Fanart from "./fanart";
import { collections } from "./services";

export interface SearchData {
    characterName: string;
    characterTags: string[];
}

interface TweetData {
    mediaData: MediaObjectV2[];
    userData: UserV2;
    createdAt: string;
}

export default class ImageGatherer {

    // private pixivEnv: Pixiv;
    // private userName: string;
    // private password: string;
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

    async _dataToMongoDB(data: TweetData): Promise<void> {
        let imageList: Fanart[] = [];
        for (const media of data.mediaData) {
            imageList.push(new Fanart(data.userData.username, media.url, data.createdAt));
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
                { value: '(#gawrt OR #ameliaRT OR #inART OR #callillust OR #artsofashes OR #IRySart OR #illustrayBAE OR #galaxillust OR  #drawMEI OR  #FineFaunart OR  #kronillust) has:images -is:retweet -is:quote -is:reply', tag: 'fanarts with medias with no retweets or quotes'}
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
                    console.log('Twitter Data:', eventData, mediaData);
                    this._dataToMongoDB(mediaData);
                } catch (e) {
                    console.error(e);
                }
            }
        );
        this.dataStream.autoReconnect = true;
    }

    async Init(): Promise<void> {
        // Pixiv api wrapper is obsolete
        // try {
        //     console.log(this.userName, this.password);
        //     this.pixivEnv = await Pixiv.
        // } catch (error) {
        //     console.log(error);
        // }
        const twitterClient = new TwitterApi(this.token);
        this.twitterClient = twitterClient.readOnly;
    }

    constructor(twitterToken: string) {
        this.token = twitterToken;
    }
}