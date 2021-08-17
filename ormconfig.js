const dotenv = require("dotenv");

if (process.env.NODE_ENV === 'production'){
   dotenv.config()
}else {
   dotenv.config({ path: '.dev.env'})
}

module.exports =  {
   "type": "postgres",
   "host": "localhost",
   "port": 5432,
   "username": process.env.DB_USER,
   "password": process.env.DB_PASSWORD,
   "database": process.env.DB_NAME,
   "synchronize": false,
   "logging": false,
   "entities": [
      "src/api/**/*.model.ts"
   ],
   "migrations": [
      "src/db/migration/**/*.ts"
   ],
   "subscribers": [
      "src/subscriber/**/*.ts"
   ],
   "cli": {
      "migrationsDir": "src/db/migration",
      "subscribersDir": "src/subscriber"
   }
}