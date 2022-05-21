import axios from 'axios';

export interface Result {
    header?: Header;
    data?: Data;
}

export interface Header {
    similarity?: string;
    thumbnail?: string;
    index_id?: number;
    index_name?: string;
    dupes?: number;
    hidden?: number
}

export interface Data {
    ext_urls?: string[];
    gelbooru_id?: number;
    danbooru_id?: number;
    yandere_id?: number;
    creator?: string;
    material?: string;
    characters?: string;
    source?: string;
    title?: string;
    pixiv_id?: number;
    member_name?: string;
    member_id?: number;
}
export interface EmbedData {
    title: string;
    thumbnail: string;
    data: string;
}

export default class Saucenao {

    _convertDataToPrintableString(results: Result[]): EmbedData {

        let thumbnail = "";
        let characters = "";
        let source = "";
        let creator = "";
        let pixivName = "";
        let pixivId = 0;
        let gelbooru_id = 0;
        let danbooru_id = 0;
        let yandere_id = 0;
        for (let data of results) {
            console.log(data.header.thumbnail);
            if (data.header.thumbnail != undefined && thumbnail === "") thumbnail = data.header.thumbnail;
            if (data.data.characters != undefined && characters === "") characters = data.data.characters;
            if (data.data.source != undefined && source === "") source = data.data.source;
            if (data.data.creator != undefined && creator === "") creator = data.data.creator;
            if (data.data.member_name != undefined && pixivName === "") pixivName = data.data.member_name;
            if (data.data.member_id != undefined && pixivId === 0) pixivId = data.data.member_id;
            if (data.data.gelbooru_id != undefined && gelbooru_id === 0) gelbooru_id = data.data.gelbooru_id;
            if (data.data.danbooru_id != undefined && danbooru_id === 0) danbooru_id = data.data.danbooru_id;
            if (data.data.yandere_id != undefined && yandere_id === 0) yandere_id = data.data.yandere_id;
        }
        console.log(results);
        let printableString = `${characters}\nBy ${creator}`;
        if (pixivId > 0) {
            printableString += ` - Pixiv: [${pixivName}](https://www.pixiv.net/en/users/${pixivId})\n`;
        } else {
            printableString += '\n';
        }
        printableString += `Source: ${source}\n`;
        if (gelbooru_id > 0) { printableString += `gelbooru: https://gelbooru.com/index.php?page=post&s=view&id=${gelbooru_id}\n`}
        if (danbooru_id > 0) { printableString += `danbooru: https://danbooru.donmai.us/posts/${danbooru_id}\n`}
        if (yandere_id > 0) { printableString += `yandere: https://yande.re/post/show/${yandere_id}\n`}
        return {
            title: "Results",
            thumbnail: thumbnail,
            data: printableString
        };
    }

    async GetImageSource(url: string): Promise<EmbedData> {
        let results: Result[] = [];
        try {
            const rep = await axios.get(`https://saucenao.com/search.php?db=999&output_type=2&testmode=1&numres=16&api_key=${this.token}&url=` + encodeURIComponent(url));
            results = rep.data.results;
        } catch (error) {
            console.error(error);
            return { title: "", thumbnail: "", data: "" };
        }
        const printableData = this._convertDataToPrintableString(results.filter(result => parseFloat(result.header.similarity) > 90));
        return printableData;
    }

    constructor(public token: string) { }
}