import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupUserDto } from './dto';
import { validateSchema } from 'utils/validation';
import { Tokens } from 'src/types';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/local/signup')
  async signupLocal(@Body() body: SignupUserDto): Promise<Tokens> {
    validateSchema(SignupUserDto, body);
    return this.authService.signupLocal(body);
  }

  @Post('/local/signin')
  async signinLocal(@Body() body: SignupUserDto): Promise<Tokens> {
    validateSchema(SignupUserDto, body);
    return this.authService.signinLocal(body);
  }

  @Post('/logout')
  async logout() {
    return this.authService.logout();
  }

  @Post('/refresh')
  async refreshTokens() {
    return this.authService.refreshTokens();
  }
}
