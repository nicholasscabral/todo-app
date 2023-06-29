import { z } from 'zod';

export const SignupUserDto = z
  .object({
    email: z.string().email(),
    name: z.string().nonempty(),
    password: z.string().min(10),
    passwordConfirmation: z.string().min(10),
  })
  .refine(
    ({ password, passwordConfirmation }) => password === passwordConfirmation,
    { message: 'As senhas não batem' },
  );
export type SignupUserDto = z.infer<typeof SignupUserDto>;
