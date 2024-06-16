import { body, cookie, validationResult } from 'express-validator';
import { Auth, User } from '@server/entities';
import {
  AuthService,
  IAuthService,
  IUserService,
  UserService,
} from '@server/service';
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
  body().custom((value, { req }) => {
    if (!req.body.username && !req.body.email) {
      throw new Error(messages.validations.userNameOrEmailRequired);
    }
    return true;
  }),
  body('email')
    .trim()
    .optional()
    .isEmail()
    .withMessage(messages.validations.provideValidEmail),
  body('username')
    .trim()
    .optional()
    .isLength({ min: 4 })
    .withMessage(messages.validations.usernameValidation),
  body('password')
    .exists({ checkFalsy: true })
    .withMessage(messages.validations.passwordRequired),
];

// User registration form validation
const userRegistrationValidation = [
  body('firstName')
    .trim()
    .exists({ checkFalsy: true })
    .withMessage(messages.validations.firstNameRequired),
  body('lastName')
    .trim()
    .exists({ checkFalsy: true })
    .withMessage(messages.validations.lastNameRequired),
  body('email')
    .trim()
    .exists({ checkFalsy: true })
    .withMessage(messages.validations.emailRequired)
    .isEmail()
    .withMessage(messages.validations.provideValidEmail)
    .custom(async (value) => {
      const existingUser: User | null = await (
        new UserService() as IUserService
      ).findByEmail(value);
      if (existingUser) {
        throw new Error(messages.validations.emailExists);
      }
    }),
  body('username')
    .trim()
    .exists({ checkFalsy: true })
    .withMessage(messages.validations.usernameRequired)
    .isLength({ min: 4 })
    .withMessage(messages.validations.usernameValidation)
    .custom(async (value) => {
      const existingAuth: Auth | null = await (
        new AuthService() as IAuthService
      ).findByUsername(value);
      if (existingAuth) {
        throw new Error(messages.validations.usernameExists);
      }
    }),
  body('password')
    .exists({ checkFalsy: true })
    .withMessage(messages.validations.passwordRequired)
    .isLength({ min: 4, max: 20 })
    .withMessage(messages.validations.passwordValidation),
  body('confirmPassword')
    .exists({ checkFalsy: true })
    .withMessage(messages.validations.confirmPasswordRequired)
    .isLength({ min: 4, max: 20 })
    .withMessage(messages.validations.passwordValidation)
    .custom((value, { req }) => value === req.body.password)
    .withMessage(messages.validations.passwordNotMatched),
];

// Refresh token validator
const refreshTokenValidation = [
  cookie('refresh_token').exists().withMessage('Invalid cookies'),
];

export {
  userLoginValidation,
  userRegistrationValidation,
  refreshTokenValidation,
};
