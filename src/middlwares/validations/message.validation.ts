import { celebrate } from "celebrate";
import Joi from "joi";

class MessageValidation {
  public newMessageSetValidation() {
    const dtoValidation = Joi.object().keys({
        id: Joi.number().required(),
        sender: Joi.any().required(),
        receiver: Joi.any().required(),
        message: Joi.any().required(),
        room: Joi.number().required(),
        room_id: Joi.string().required(),
        time: Joi.date().required(),
        created_at: Joi.date().required(),
        updated_at: Joi.date().required()
    })

    return celebrate({
      body: Joi.object({
        messages: Joi.array().min(1).items(dtoValidation).min(1).required(),
      }),
    })
  }
}

export const messageValidation = new MessageValidation();
