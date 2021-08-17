import crypto from "bcrypt"
import jwt from 'jsonwebtoken'
import { jwtCred } from "../enums"

export class AuthModule {
    static hashPassWord(password: string): string {
        return crypto.hashSync(password, process.env.SALT_ROUNDS || 10)
    }


    static compareHash(password: string, hash: string): boolean {
        return crypto.compareSync(password, hash)
    }


    static generateJWT(details: jwtCred): string {
        return jwt.sign(details, process.env.JWT_SECRET || 'supersecrete', {
            expiresIn: process.env.JWT_EXP_TIME || '6h'
        })
    }
}

