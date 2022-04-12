import { ObjectId } from "mongodb";

export default class Fanart {
    constructor(
        public author: string,
        public url: string,
        public postDate: string,
        public tags: string[],
        public id?: ObjectId
        ) {}
}