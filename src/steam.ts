import SteamApi from 'steamapi';

export interface Genre {
    id?: string;
    description?: string;
}

export interface GameData {
    name?: string;
    steamURL?: string;
    short_description?: string;
    genres?: Genre[];
    header_image?: string;
    found?: boolean;
}

export default class SteamHandler {

    private steam: SteamApi;

    async GetUserData(query: string): Promise<SteamApi.PlayerSummary> {

        console.log("Getting user ID...");
        let steamID: string = "";
        try {
            steamID = await this.steam.resolve(`https://steamcommunity.com/id/${query}/`);
        } catch (error) {
            console.error(error);
            return;
        }

        console.log("Getting user summary...");
        const userSummary = await this.steam.getUserSummary(steamID);
        console.log("userSummary", userSummary);

        return userSummary;
    }

    async GetGameData(query: string): Promise<GameData> {
        console.log("Gertting game list...")
        let appList: SteamApi.App[] = [];
        try {
            appList = await this.steam.getAppList();
        } catch (error) {
            console.error(error);
            console.log("test");
            return {found: false};
        }

        let appID: string = "";
        console.log("Finding app...", appList.length, query);
        for (let i = 0; i < appList.length; i++) {
            if (appList[i].name.toLowerCase() === query.toLowerCase()) {
                appID = appList[i].appid.toString();
                break;
            }
        }

        console.log("App:", appID);

        if (appID === "") return {found: false};

        const gameDetails: GameData = await this.steam.getGameDetails(appID);
        gameDetails.steamURL = `https://store.steampowered.com/app/${appID}`;
        gameDetails.found = true;

        console.log(gameDetails);

        return gameDetails;
    }

    constructor(private token: string) {
        this.steam = new SteamApi(this.token);
    }
}