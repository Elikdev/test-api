import "reflect-metadata";
import * as dotenv from 'dotenv';

if (process.env.NODE_ENV === 'production'){
    dotenv.config()
}else {
    dotenv.config({ path: '.test.env'})
}

import app from "./app";
import * as dbConfig from '../ormconfig.js'
import {createConnection} from "typeorm";

createConnection(dbConfig).then(async connection => {
    console.log("Here you can setup and run express/koa/any other framework.");
}).catch(error => console.log(error));

const PORT : string | number = process.env.PORT || 3000

app.listen(PORT, () => {
    console.log("app is listening 🚀 on ", PORT )
})


