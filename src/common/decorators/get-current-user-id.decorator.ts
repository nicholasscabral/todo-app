import { ExecutionContext, createParamDecorator } from '@nestjs/common';

export const GetCurrentUserId = createParamDecorator(
  (data: undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user['sub'];
  },
);
