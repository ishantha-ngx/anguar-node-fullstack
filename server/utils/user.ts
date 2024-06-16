import { User } from '@server/entities';
import { UserStatus } from '@server/enums';
import { ErrorResponse } from '@server/errors';
import messages from '@server/messages';
import { StatusCodes } from 'http-status-codes';

export const checkUserStatus = (user: User) => {
  if (!user.emailConfirmed || user.status === UserStatus.INACTIVE) {
    throw new ErrorResponse({
      code: StatusCodes.UNAUTHORIZED,
      message: messages.error.user.notActive,
    });
  }
  if (user.status === UserStatus.BLOCKED) {
    throw new ErrorResponse({
      code: StatusCodes.UNAUTHORIZED,
      message: messages.error.user.blocked,
    });
  }
};
