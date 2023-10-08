import Joi from "joi";
import { joiPasswordExtendCore } from "joi-password";

const JoiPassword = Joi.extend(joiPasswordExtendCore);

export default (user) => {
  const schema = Joi.object({
    email: Joi.string().required().min(5).max(254).email(),
    password: JoiPassword.string()
      .required()
      .min(8)
      .max(50)
      .minOfLowercase(1)
      .minOfUppercase(1)
      .minOfNumeric(1)
      .noWhiteSpaces(),
  });
  return schema.validate(user);
};
