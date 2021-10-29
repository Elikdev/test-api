import crypto from "bcrypt"
import jwt from 'jsonwebtoken'
import { jwtCred } from "./enum"

class AuthUtils {
 public hashPassWord(password: string): string {
  return crypto.hashSync(password, process.env.SALT_ROUNDS || 10);
 }

 public compareHash(password: string, hash: string): boolean {
  return crypto.compareSync(password, hash);
 }

 public generateJWT(details: jwtCred): string {
  return jwt.sign(details, process.env.JWT_SECRET || "supersecrete");
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

 public generateRefCode(length = 8): string {
  const uniqueid = Math.round((Math.random() * 10) * Math.round(Date.now())).toString(36) //max-length == 9 or 8
	let ref = ""
	
	for (let i = 0; i < length; i++) {
		ref += uniqueid[i]
	}
  return ref
 }
}

export const AuthModule = new AuthUtils()