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
            body:Joi.object({
                id:Joi.number().required(),
                status:Joi.valid(RequestStatus.ACCEPTED, RequestStatus.REJECTED).required(),
                reason:Joi.string()
            })
        })
    }
}

export const requestValidation = new RequestValidation()