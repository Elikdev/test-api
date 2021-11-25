import {celebrate, Joi} from 'celebrate'


class InfluencerValidation {
  public setRates() {
    return celebrate({
      body: Joi.object({
        amount: Joi.number().required(),
        id: Joi.number().required(),
        type: Joi.valid("dm", "shoutout").required(),
      }),
    })
  }

  public getOneInfluencerValidation() {
    return celebrate({
      params: {
        id: Joi.number().required(),
      },
    })
  }
}

export const influencerValidation = new InfluencerValidation()