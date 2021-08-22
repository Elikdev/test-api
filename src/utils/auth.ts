import crypto from "bcrypt"
import { NextFunction, Request, Response } from "express"
import jwt from 'jsonwebtoken'
import { jwtCred } from "../enums"
import { errorResponse } from "./response"

class AuthUtils {
    public hashPassWord(password: string): string {
        return crypto.hashSync(password, process.env.SALT_ROUNDS || 10)
    }


    public compareHash(password: string, hash: string): boolean {
        return crypto.compareSync(password, hash)
    }


    public generateJWT(details: jwtCred): string {
        return jwt.sign(details, process.env.JWT_SECRET || 'supersecrete', {
            expiresIn: process.env.JWT_EXP_TIME || '6h'
        })
    }

    public verifyToken(token: string): { verified: boolean; userDetails?: jwtCred }  {
        try {
           const user : any = jwt.verify(token, process.env.JWT_SECRET || 'supersecrete')
           delete user.exp
           delete user.iat
            return {
                verified: true,
                userDetails : user
            }
        } catch (error) {
            console.log(error)
            return {
                verified: false,
            }
        }
    }

    public isAuthenticatedUser  = (req: Request, res: Response, next:NextFunction) =>  {
        const token = req.headers.authorization
        if (!token) {
            return errorResponse(res, "Unauthorized", 401)
        }
        const t = token.split(" ")
        if(t.length !== 2){
            return errorResponse(res, "Unauthorized", 401)
        }
        if (t[0].toLocaleLowerCase() !== 'bearer') {
            return errorResponse(res, "Unauthorized", 401)
        }
        const verify = this.verifyToken(t[1])
        if(!verify.verified){
            return errorResponse(res, "Unauthorized", 401)
        }

        
        (req as any ).user  = verify.userDetails
        

        next()
    }
}

export const AuthModule = new AuthUtils()
