/** @format */

import "reflect-metadata"
import * as dotenv from "dotenv"
import app from "./app"
import * as dbConfig from "../ormconfig.js"
import { createConnection } from "typeorm"
import {createClient} from "redis"

if (process.env.NODE_ENV === "production") {
	dotenv.config() //env
} else {
	dotenv.config({ path: ".env.local" })
}

createConnection(dbConfig)
	.then(async (connection) => {
		console.log("Here you can setup and run express/koa/any other framework.")
	})
	.catch((error) => console.log(error))

const PORT: string | number = process.env.PORT || 3000


let client: any
(async () => {
	 client = createClient({
		url: process.env.REDIS_URL || "redis://:hSV8syLERqn9rGWPwJVg3Ol4cBYEXHoc@redis-10240.c258.us-east-1-4.ec2.cloud.redislabs.com:10240"
	});
	await client.connect()
})()

client?.on("connect", () => console.log("Connected to redis"))

client?.on("ready", () => console.log("Client connected to redis and ready for use"))

client?.on("error", (err) => console.log("Error from redis client", err))

client?.on("end", () => console.log("Client disconnected from redis"))

app.listen(PORT, () => {
	console.log("app is listening 🚀 on ", PORT)
})

export const redisClient = client
