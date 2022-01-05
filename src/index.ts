/** @format */

import "reflect-metadata"
import * as dotenv from "dotenv"
import app from "./app"
import * as dbConfig from "../ormconfig.js"
import { createConnection } from "typeorm"

if (process.env.NODE_ENV === "production") {
	dotenv.config()
} else {
	dotenv.config({ path: ".env.local" })
}

createConnection(dbConfig)
	.then(async (connection) => {
		console.log("Here you can setup and run express/koa/any other framework.")
	})
	.catch((error) => console.log(error))

const PORT: string | number = process.env.PORT || 3000

app.listen(PORT, () => {
	console.log("app is listening 🚀 on ", PORT)
})
