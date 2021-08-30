import {Request, Response} from "express";
import {userService} from "./user.service";
import {errorResponse, successRes} from "../../utils/response";

class UserControllers {
 public async getUserDetails(req: Request, res: Response) {
  const response = await userService.getUser(req.body.user.id);
  if (!response.status) {
   return errorResponse(res, response.message, response.statusCode);
  }
  return successRes(res, response.data);
 }

 public async signUp(req: Request, res: Response) {
  try {
   const userDTO = req.body;
   const response = await userService.SignUp(userDTO);
   if (!response.status) {
    return errorResponse(res, response.message, response.statusCode);
   }
   return successRes(res, response.data);
  } catch (e) {
   console.log(e);
   return errorResponse(res, "an error occured contact support", 500);
  }
 }

 public async signIn(req: Request, res: Response) {
  try {
   const userDTO = req.body;
   const response = await userService.signIn(userDTO);
   if (!response.status) {
    return errorResponse(res, response.message, response.statusCode);
   }
   return successRes(res, response.data);
  } catch (e) {
   console.log(e);
   return errorResponse(res, "an error occured contact support", 500);
  }
 }

 public async forgotPassword(req: Request, res: Response){
  try {
   const userDTO = req.body;
   const response = await userService.forgotPassword(userDTO);

   if(!response.status){
    return errorResponse(res, response.message, response.statusCode)
   }

   return successRes(res, response.data, response.message)
  } catch (error) {
   console.log(error);
   return errorResponse(res, "an error occured contact support", 500)
  }
 }

 public async verifyOtp(req: Request, res: Response){
  try {
   const userDTO = req.body;
   const response = await userService.verifyOtp(userDTO);

   if(!response.status){
    return errorResponse(res, response.message, response.statusCode)
   }

   return successRes(res, response.data, response.message)
  } catch (error) {
   console.log(error);
   return errorResponse(res, "an error occured contact support", 500)
  }
 }

 public async resetPassword(req: Request, res: Response){
  try {
   const userDTO = req.body;
   const updatedUserDTO = {...userDTO, token: req.query.token}
   const response = await userService.resetPassword(updatedUserDTO);

   if(!response.status){
    return errorResponse(res, response.message, response.statusCode)
   }

   return successRes(res, response.data, response.message)
  } catch (error) {
   console.log(error);
   return errorResponse(res, "an error occured contact support", 500)
  }
 }

 public async updateProfile(req: Request, res: Response) {
  try {
   const authUser = (req as any).user;
   const userDTO = req.body;
   const response = await userService.updateProfile(authUser, userDTO);

   if   (!response.status)   {
    return errorResponse(res, response.message, response.statusCode);
   }

   return successRes(res, response.data, response.message);
  } catch (error) {
   console.log(error);
   return errorResponse(res, "an error occured contact support", 500);
  }
 }
}

export const userController = new UserControllers()