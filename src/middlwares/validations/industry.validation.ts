import { celebrate } from "celebrate";
import Joi from "joi";

class IndustryValidation {
  public addIndustryValidation() {
    const dtoValidation = Joi.object().keys({
        name: Joi.string().required(),
        slug: Joi.string().required()
    })

    return celebrate({
        body: Joi.object({
            industries:Joi.array().min(1).items(dtoValidation).min(1).required()
        })
    });
  }
}

export const industryValidation = new IndustryValidation();
