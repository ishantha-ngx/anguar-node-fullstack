const messages = {
  error: {
    urlNotFound: 'The Requested URL Was Not Found On This Server',
    databaseConnection: 'Error connecting to database',
    badRequest: 'Bad request',
    internalServerError: 'Something went wrong',
    authenticationFailed: 'The email or password you entered is incorrect',
  },

  validations: {
    emailRequired: 'Email is required',
    provideValidEmail: 'Please provide valid email',
    passwordRequired: 'Password is required',
    emailExists: 'This e-mail address is already exists',
    passwordValidation: 'Password must be between 4 and 20 characters'
  }
};

export default messages;
