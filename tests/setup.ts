// import * as dotenv from 'dotenv';

// if (process.env.NODE_ENV === 'production') {
//     dotenv.config()
// } else {
//     dotenv.config({ path: '.test.env' })
// }

// import { createConnection, getConnection } from "typeorm"
// import { User } from '../src/api/User/user.model';



// beforeAll(async () => {
//     const connection = await createConnection({
//         type: "postgres",
//         host: "localhost",
//         port: 5432,
//         synchronize: true,
//         logging:false,
//         username: process.env.DB_USER,
//         password: process.env.DB_PASSWORD,
//         database: 'attenvo_test',
//         entities: [
//             User
//         ],
//     })
    
// })

// test('should have connected to db', () => {
//     const connection = getConnection()
//     expect(connection).toBeDefined()
// });

// afterAll(async () => {
//     const connection = getConnection()
//     await connection.dropDatabase()
//     await connection.close()
// })