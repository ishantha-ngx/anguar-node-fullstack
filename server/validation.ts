import { body, validationResult } from 'express-validator';
import { User } from '@server/entities';
import { IUserModel, UserModel } from '@server/models';
import { RequestVaidationError } from '@server/errors';
import messages from '@server/messages';

// Run validation rules
export const runValidation = (req: any) => {
  const validationErrors = validationResult(req as Request);
  if (!validationErrors.isEmpty()) {
    throw new RequestVaidationError(validationErrors.array());
  }
};

// User login form validation
const userLoginValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage(messages.validations.emailRequired)
    .isEmail()
    .withMessage(messages.validations.provideValidEmail),
  body('password')
    .notEmpty()
    .withMessage(messages.validations.passwordRequired),
];

// User registration form validation
const userRegistrationValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage(messages.validations.emailRequired)
    .isEmail()
    .withMessage(messages.validations.provideValidEmail)
    .custom(async (value) => {
      const existingUser: User = await (
        new UserModel() as IUserModel
      ).findByEmail(value);
      if (existingUser) {
        throw new Error(messages.validations.emailExists);
      }
    }),
  body('password')
    .notEmpty()
    .withMessage(messages.validations.passwordRequired)
    .isLength({ min: 4, max: 20 })
    .withMessage(messages.validations.passwordValidation),
];

export { userLoginValidation, userRegistrationValidation };
