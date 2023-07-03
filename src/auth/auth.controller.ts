import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupUserDto } from './dto';
import { validateSchema } from 'utils/validation';
import { Tokens } from 'src/types';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('local/signup')
  @HttpCode(HttpStatus.CREATED)
  async signupLocal(@Body() body: SignupUserDto): Promise<Tokens> {
    validateSchema(SignupUserDto, body);
    return this.authService.signupLocal(body);
  }

  @Post('local/signin')
  @HttpCode(HttpStatus.OK)
  async signinLocal(@Body() body: SignupUserDto): Promise<Tokens> {
    validateSchema(SignupUserDto, body);
    return this.authService.signinLocal(body);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: Request) {
    const user = req.user;
    return this.authService.logout(user['sub']);
  }

  @UseGuards(AuthGuard('jwt-refresh'))
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshTokens(@Req() req: Request) {
    const user = req.user;
    return this.authService.refreshTokens(user['sub'], user['refreshToken']);
  }
}
