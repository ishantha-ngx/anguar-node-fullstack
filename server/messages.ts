const messages = {
  error: {
    notFound: 'Not Found',
    urlNotFound: 'The Requested URL Was Not Found On This Server',
    databaseConnection: 'Error connecting to database',
    badRequest: 'Bad request',
    internalServerError: 'Something went wrong',
    authenticationFailed: 'The email or password you entered is incorrect',
    auth: {
      missing: 'Missing authentication',
      notLoggedIn: 'You are not logged in',
    },
    user: {
      notActive: 'Your account is not activated yet. Please confirm the email',
      blocked: 'Your user account is blocked. Please contact administrator',
    },
    token: {
      expired: 'Token expired',
      invalid: 'Invalid token',
    },
  },

  validations: {
    firstNameRequired: 'First name is required',
    lastNameRequired: 'Last name is required',
    usernameRequired: 'Username is required',
    emailRequired: 'Email is required',
    userNameOrEmailRequired: 'Username or Email is required',
    provideValidEmail: 'Please provide valid email',
    passwordRequired: 'Password is required',
    confirmPasswordRequired: 'Confirm password is required',
    emailExists: 'This e-mail address is already exists',
    usernameExists: 'This username is already exists',
    passwordValidation: 'Password must be between 4 and 20 characters',
    usernameValidation: 'Username must have atleast 4 characters',
    passwordNotMatched: 'The passwords do not match',
  },
};

export default messages;
