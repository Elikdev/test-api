import { createClient } from "redis";


let client: any

client = createClient({
 url: process.env.REDIS_URL || "redis://:hSV8syLERqn9rGWPwJVg3Ol4cBYEXHoc@redis-10240.c258.us-east-1-4.ec2.cloud.redislabs.com:10240"
});

client.connect().then(() => {
 console.log("<<<< connected to redis >>>>")
}).catch((error:any) => {
 console.log('Redis Error:', error)
})

// client?.on("connect", () => console.log("Connected to redis"))

// client?.on("ready", () => console.log("Client connected to redis and ready for use"))

// client?.on("error", (err) => console.log("Error from redis client", err))

// client?.on("end", () => console.log("Client disconnected from redis"))

export default client
