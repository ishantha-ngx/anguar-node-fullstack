import { User } from '@server/entities';

// User Response
export class UserResponce {
  id: string;
  email: string;
  name: string;
  isAdmin: boolean;

  constructor(user: User) {
    this.id = user.id;
    this.email = user.email;
    this.name = user.email;
    this.isAdmin = Boolean(user.isAdmin);
  }
}

// Auth Response
export class AuthResponse {
  user: UserResponce;
  accessToken: string;
  refreshToken: string;

  constructor(
    user: User,
    token: { accessToken: string; refreshToken: string }
  ) {
    this.user = new UserResponce(user);
    this.accessToken = token.accessToken;
    this.refreshToken = token.refreshToken;
  }
}
