import saucenao from 'saucenao';

export default class Saucenao {

    private token: string;
    private sauceNAO;

    async GetImageSource(url: string) {
        console.log("saucenmao active");
        try {
            const rep = await this.sauceNAO(url);
            console.log(rep);
        } catch (error) {
            console.error(error);
            return;
        }
    }

    constructor(token: string) {
        this.token = token;

        this.sauceNAO = new saucenao(token);
    }
}