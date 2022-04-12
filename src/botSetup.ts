import { CommandClient, VoiceConnectObject } from 'detritus-client';
import { Embed } from 'detritus-client/lib/utils';
import Saucenao from './saucenao';
import SteamHandler from './steam';
import ImageGatherer from './scrapping';
import { collections } from './services';
import Fanart from './fanart';
import * as fs from "fs";
import axios from 'axios';
import FormData from 'form-data';

export default class CustomClient {

    private commandClient: CommandClient;

    private _createNewBot(token: string, prefix: string): CommandClient {
        const commandClient = new CommandClient(token, {
            prefix: prefix,
        })
    
        commandClient.add({
            name: "user",
            run: async (context, args) => {
                const embed = new Embed();
        
                const userData = await this.steamHandler.GetUserData(args.user);
    
                embed.setAuthor(userData.nickname, userData.avatar.small, userData.url);
                embed.setFooter(userData.steamID);
                return context.editOrReply({embed, reference: true});
            }
        });
    
        commandClient.add({
            name: "game",
            run: async (context, args) => {
    
                const embed = new Embed();
        
                // Retrieve steam user data here and set the embed message Field
                const gameData = await this.steamHandler.GetGameData(args.game);
    
                if (gameData.found === false) return context.reply('Game not found.');
        
                embed.setAuthor(gameData.name, "", gameData.steamURL);
                embed.setDescription(gameData.short_description);
                embed.setImage(gameData.header_image);
                let footer: string = "";
                for (let items of gameData.genres) {
                    footer += `${items.description} `;
                }
                embed.setFooter(footer);
                
                return context.editOrReply({embed, reference: true});
            }
        });
    
        commandClient.add({
            name: "sauce",
            run: async (context, args) => {
                const embed = new Embed();
                const sauceNAOData = await this.saucenaoHandler.GetImageSource(args.sauce);
                console.log(sauceNAOData);
                embed.setTitle("Results");
                embed.setThumbnail(sauceNAOData.thumbnail);
                embed.setDescription(sauceNAOData.data);
                return context.editOrReply({embed, reference: true});
            }
        });
    
        // commandClient.add({
        //     name: "join",
        //     onBefore: (context) => context.client.isOwner(context.userId),
        //     onCancel: (context) => context.reply("Unauthorized."),
        //     run: async (context) => {
        //         for (let chan of context.message.guild.voiceStates) {
        //             if (chan[0] === context.message.author.id) {
        //                 this.voiceConnection = await context.client.voiceConnect(context.message.guildId, chan[1].channelId);
        //                 return context.reply("Joined.");
        //             }
        //         }
        //         return context.reply("Not connected to a voice channel.");
        //     }
        // });

        commandClient.add({
            name: "start",
            run: (context) => {
                this.imagesHandler.StartMonitoring(context);
            }
        });
    
        commandClient.add({
            name: "stop",
            run: (context, args) => {
                this.imagesHandler.Close();
            }
        });

        commandClient.add({
            name: "addrules",
            run: async (context) => {
                await this.imagesHandler.AddStreamRules()
            }
        })

        commandClient.add({
            name: "getfanart",
            run: async (context) => {
                try {
                    const fanarts = (await collections.vtubers.find({}).toArray()) as unknown as Fanart[];
                    console.log(fanarts);
                } catch (e) {
                    console.error(e);
                }
            }
        })

        commandClient.add({
            name: "testim",
            run: async (context, args) => {
                const test = await this.imagesHandler._getTweetData(args.testim);
                console.log(test);
            }
        })

        commandClient.add({
            name: "getarchive",
            run: async (context, args) => {
                const tags = (args.getarchive as string).split(" ");
                const path = await this.imagesHandler.GetDownloadableArchive(tags, context.message.author.username);
                try {
                    const form = new FormData();
                    form.append('file', fs.createReadStream(path.tgzPath), `${path.name}.tgz`);
                    const response = await axios.post("https://file.io/?expires=1w", form, {
                        headers: {
                            ...form.getHeaders()
                        }
                    });
                    console.log(response.data);
                    await context.reply(response.data.link);
                    fs.rmdirSync(path.path, {recursive: true});
                    fs.unlinkSync(path.tgzPath);
                } catch (error) {
                    console.error(error);
                }
            }
        })

        return commandClient;
    }

    async run() {
        await this.imagesHandler.Init();
        return await this.commandClient.run();
    }

    constructor(token: string, prefix: string,public steamHandler: SteamHandler, public saucenaoHandler: Saucenao, public imagesHandler: ImageGatherer) {
        this.commandClient = this._createNewBot(token, prefix);
    }
}