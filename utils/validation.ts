import { BadRequestException } from '@nestjs/common';
import { ZodError, ZodTypeAny } from 'zod';

export function validateSchema(schema: ZodTypeAny, payload: any): void {
  try {
    schema.parse(payload);
  } catch (e: unknown) {
    if (e instanceof ZodError) {
      console.log(e.issues);
      throw new BadRequestException({
        success: false,
        error: sanitizeError(e),
      });
    }
  }
}

function sanitizeError(e: ZodError) {
  return e.issues.map((issue) => ({
    field: issue.path[0],
    code: issue.code,
    message: issue.message,
  }));
}
