export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
}

export interface LoginPayload {
  email?: string;
  username?: string;
  password: string;
}
