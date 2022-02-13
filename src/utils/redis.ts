// import { createClient } from "redis";


// let client: any

// client = createClient({
//  url: process.env.REDIS_URL
// });

// (async () => {
//   await client.connect()
// })()

// client?.on("connect", () => console.log("Connected to redis"))

// client?.on("ready", () => console.log("Client connected to redis and ready for use"))

// client?.on("error", (err) => console.log("Error from redis client", err))

// client?.on("end", () => console.log("Client disconnected from redis"))

// export default client