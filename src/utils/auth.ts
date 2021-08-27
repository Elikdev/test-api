import crypto from "bcrypt"
import { NextFunction, Request, Response } from "express"
import jwt from 'jsonwebtoken'
import { jwtCred } from "../enums"
import { errorResponse } from "./response"

class AuthUtils {
 public hashPassWord(password: string): string {
  return crypto.hashSync(password, process.env.SALT_ROUNDS || 10);
 }

 public compareHash(password: string, hash: string): boolean {
  return crypto.compareSync(password, hash);
 }

 public generateJWT(details: jwtCred): string {
  return jwt.sign(details, process.env.JWT_SECRET || "supersecrete", {
   expiresIn: process.env.JWT_EXP_TIME || "6h",
  });
 }

 public verifyToken(token: string): {
  verified: boolean;
  userDetails?: jwtCred;
 } {
  try {
   const user: any = jwt.verify(
    token,
    process.env.JWT_SECRET || "supersecrete"
   );
   delete user.exp;
   delete user.iat;
   return {
    verified: true,
    userDetails: user,
   };
  } catch (error) {
   console.log(error);
   return {
    verified: false,
   };
  }
 }

 public isAuthenticatedUser = (
  req: Request,
  res: Response,
  next: NextFunction
 ) => {
  const token = req.headers.authorization;
  if (!token) {
   return errorResponse(res, "Unauthorized", 401);
  }
  const t = token.split(" ");
  if (t.length !== 2) {
   return errorResponse(res, "Unauthorized", 401);
  }
  if (t[0].toLocaleLowerCase() !== "bearer") {
   return errorResponse(res, "Unauthorized", 401);
  }
  const verify = this.verifyToken(t[1]);
  if (!verify.verified) {
   return errorResponse(res, "Unauthorized", 401);
  }

  (req as any).user = verify.userDetails;

  next();
 };

 public generateOtp(length = 5): string {
  const digits = "0123456789";
  let otp = "";
  for (let i = 0; i < length; i++) {
   otp += digits[Math.floor(Math.random() * 10)];
  }
  return otp;
 }

 public createOtpToken(payload: {id: number}){
  return jwt.sign(payload, process.env.JWT_SECRET || "supersecrete", {expiresIn: "5m"} )
 }

 public verifyOtpToken(token: string): {
  verified: boolean;
  otpDetails?: {id: number};
  message?: string;
 } {
  try {
   const user: any = jwt.verify(
    token,
    process.env.JWT_SECRET || "supersecrete"
   );
   delete user.exp;
   delete user.iat;
   return {
    verified: true,
    otpDetails: user,
   };
  } catch (error) {
   console.log(error);
   if(error.name === "JsonWebTokenError"){
    return {
     verified: false,
     message: "Invalid token format"
    }
   }
   if(error.name === "TokenExpiredError"){
    return {
     verified: false,
     message: "Expired token"
    }
  }
  return {
   verified: false,
  };
 }
}
}

export const AuthModule = new AuthUtils()
