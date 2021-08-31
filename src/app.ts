import express, { Request, Response } from 'express'
import * as bodyParser from "body-parser";
import helmet from 'helmet'
import { isCelebrateError } from "celebrate";
import { errorResponse } from "./utils/response";
import { userRouter } from './api/User/user.router';
import walletRouter from './api/Wallet/wallet.route'
import interestRouter from './api/Interests/interest.route'


const app = express()
app.use(helmet())
app.use(bodyParser.urlencoded())
app.use(bodyParser.json())


/** Routes **/
app.use('/user', userRouter)
app.use('/interest', interestRouter)
app.use('/wallet', walletRouter)

app.use('*', (req, res) => {
    return errorResponse(res, "route not found", 404)
})

app.use((error: any, _req: Request, res: Response, next: any) => {
    if (isCelebrateError(error)) {
        const errorMessage = error.details.get('body') || error.details.get('query') || error.details.get('params')
        const message = errorMessage!.message.replace(/"/g, "")
        return errorResponse(res, message);
    }
    next()
});

export default app

