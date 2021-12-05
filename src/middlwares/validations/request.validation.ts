import { celebrate, Joi} from "celebrate";
// import Joi from "joi";
import { RequestDelivery, RequestStatus, RequestType } from "../../utils/enum";


class RequestValidation{

    public newRequest(){
        return celebrate({
            body:Joi.object({
                purpose:Joi.string().when('request_type', {
                    is: Joi.exist().equal(RequestType.SHOUT_OUT),
                    then: Joi.string().required(),
                    otherwise: Joi.optional(),
                }),
                influencer:Joi.number().required(),
                fan_introduction:Joi.string().when('request_type', {
                    is: Joi.exist().equal(RequestType.SHOUT_OUT),
                    then: Joi.string().required(),
                    otherwise: Joi.string().optional(),
                }),
                shoutout_message:Joi.string().when('request_type', {
                    is: Joi.exist().equal(RequestType.SHOUT_OUT),
                    then: Joi.string().required(),
                    otherwise: Joi.string().optional(),
                }),
                request_type:Joi.valid(RequestType.DM, RequestType.SHOUT_OUT).required(),
                request_delivery:Joi.valid(RequestDelivery.EXPRESS, RequestDelivery.STANDARD)
            })
        })
    }

    public updateRequest(){
        return celebrate({
            body: Joi.object({
                type: Joi.valid("accept", "decline").required(),
                reason: Joi.string().when("type", {
                    is: Joi.exist().equal("decline"),
                    then: Joi.string().required(),
                    otherwise: Joi.optional()
                })
            }),
            params: {
                requestId: Joi.number().required(),
            }
        })
    }

    public cancelRequest(){
        return celebrate({
            params: {
                requestId: Joi.number().required(),
            }
        })
    }

    public saveShoutVideo(){
        return celebrate({
            body: Joi.object({
                requestId: Joi.number().required(),
                video_url: Joi.string().uri().required()
            })
        })
    }

    public getShoutOutByInfluencer(){
        return celebrate({
            params: {
                influencerId: Joi.number().required(),
            }
        })
    }
}

export const requestValidation = new RequestValidation()