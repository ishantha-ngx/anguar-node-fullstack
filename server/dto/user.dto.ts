import { User } from '@server/entities';

// User Response
export class UserDTO {
  id!: string;
  email!: string;
  firstName!: string;
  lastName!: string;

  // constructor(user: User) {
  //   this.id = user.id;
  //   this.email = user.email;
  //   this.firstName = user.firstName;
  //   this.lastName = user.lastName;
  // }
}

// Auth Response
export class AuthDTO {
  user!: UserDTO;
  accessToken!: string;
  refreshToken!: string;

  constructor(
    user: User,
    token: { accessToken: string; refreshToken: string }
  ) {
    this.user = user.toDTO();
    this.accessToken = token.accessToken;
    this.refreshToken = token.refreshToken;
  }
}
