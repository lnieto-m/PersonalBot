import { CommandClient } from 'detritus-client';
import { Embed } from 'detritus-client/lib/utils';
import Saucenao from './saucenao';
import SteamHandler from './steam';

export default function createNewBot(token: string, prefix: string, steamHandler: SteamHandler, saucenaoHandler: Saucenao): CommandClient {
    const commandClient = new CommandClient(token, {
        prefix: prefix,
    })

    commandClient.add({
        name: "user",
        run: async (context, args) => {
            const embed = new Embed();
    
            const userData = await steamHandler.GetUserData(args.user);

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
            const gameData = await steamHandler.GetGameData(args.game);

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
            console.log(args);
            // await saucenaoHandler.GetImageSource(args.sauce);
            return context.reply("sauced");
        }
    });
    
    return commandClient;
}