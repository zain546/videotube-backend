import Joi from "joi";

const registerUserschema = Joi.object({
  username: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  fullName: Joi.string().required(),
});

const loginUserSchema = Joi.object({
  email: Joi.string().email().trim().lowercase(),
  username: Joi.string().trim().lowercase(),
  password: Joi.string().required(),
}).or("email", "username"); // Requires either email or username

const changePasswordSchema = Joi.object({
  oldPassword: Joi.string().required(),
  newPassword: Joi.string().required(),
});

const updateUserSchema = Joi.object({
  fullName: Joi.string().trim(),
  email: Joi.string().email().trim().lowercase(),
  username: Joi.string().trim().lowercase(),
});

export {
  registerUserschema,
  loginUserSchema,
  changePasswordSchema,
  updateUserSchema,
};
