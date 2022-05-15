# A simple Discord Bot

This project is a simple web server hosting a Discord bot.   
Its main purpose is gathering Fanarts posted on Twitter with specific tags, tweet data is then sent to a mongoDB Database which data can be accessed from https://lnieto-m.github.io/db-viewer/ .
It also has a basic integration of the steam API and [SauceNAO](https://saucenao.com/).   

## Getting started

First you need to setup the following environnement variables.   

| Name                 | Value                                                                                           |
|----------------------|-------------------------------------------------------------------------------------------------|
| DISCORD              | [token](https://github.com/reactiflux/discord-irc/wiki/Creating-a-discord-bot-&-getting-a-token)|
| STEAM                | [token](https://help.pebblehost.com/en/game-hosting/how-to-find-your-steam-game-token)          |
| SAUCENAO             | [token](https://saucenao.com/user.php?page=search-api)                                          |
| TWITTER_BEARER_TOKEN | [token](https://developer.twitter.com/en/docs/authentication/oauth-2-0/bearer-tokens)           |
| DB_CONN_STRING       | [mongodb setup](https://www.mongodb.com/compatibility/using-typescript-with-mongodb-tutorial)   |
| DB_NAME              |                                                                                                 |
| DB_COLLECTION_NAME   |                                                                                                 |
| PORT                 | your_port                                                                                       |

Then you can install dependencies and run it   
`npm i`   
`npm run start`   

### Basic commands

`!sauce <image_link>`   
Use the sauceNAO API to get the image's author data   

`!user <query>` `!game <query>`   
Retrive data of the given game or user   

`!setcontext`   
The bot will automatically start collecting twitter post on start, this commands let the bot post his data on the channel where this command is used   