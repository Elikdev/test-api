import { celebrate } from "celebrate";
import Joi from "joi";

class IndustryValidation {
  public addIndustryValidation() {
    return celebrate({
        body: Joi.object({
            industries:Joi.array().required().items({
                name: Joi.string().required() ,
                slug: Joi.string().required()
            })
        })
    });
  }
}

export const industryValidation = new IndustryValidation();
