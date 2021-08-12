import dotenv from "dotenv";

if (process.NODE_ENV === 'production'){
   dotenv.config()
}else {
   dotenv.config({ path: '.test.env'})
}

export default  {
   "type": "pg",
   "host": "localhost",
   "port": 3306,
   "username": process.env.DB_USER,
   "password": process.env.DB_PASSWORD,
   "database": process.env.DB_NAME,
   "synchronize": false,
   "logging": false,
   "entities": [
      "src/db/api/**/*.model.ts"
   ],
   "migrations": [
      "src/db/migration/**/*.ts"
   ],
   "subscribers": [
      "src/subscriber/**/*.ts"
   ],
   "cli": {
      "entitiesDir": "src/db/api/",
      "migrationsDir": "src/db/migration",
      "subscribersDir": "src/subscriber"
   }
}