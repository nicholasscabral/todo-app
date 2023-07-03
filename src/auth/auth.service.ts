import { Injectable } from '@nestjs/common';
import { SignupUserDto } from './dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { Tokens } from 'src/types';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async signupLocal(data: SignupUserDto): Promise<Tokens> {
    const hash = await this.hashData(data.password);
    console.log({ hash });
    const newUser = await this.prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        hash,
      },
    });

    const tokens = await this.generateTokens(newUser.id, newUser.email);
    await this.updateRtHash(newUser.id, tokens.refreshToken);

    return tokens;
  }

  async signinLocal() {}

  async logout() {}

  async refreshTokens() {}

  async updateRtHash(userId: string, rt: string) {
    const hash: string = await this.hashData(rt);
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: hash },
    });
  }

  async hashData(data: string): Promise<string> {
    return bcrypt.hashSync(data, 10);
  }

  async generateTokens(userId: string, email: string): Promise<Tokens> {
    const [at, rt] = await Promise.all([
      await this.jwtService.signAsync(
        { sub: userId, email },
        { expiresIn: 60 * 15, secret: process.env.JWT_AT_SECRET },
      ),
      await this.jwtService.signAsync(
        { sub: userId, email },
        { expiresIn: 60 * 60 * 24 * 7, secret: process.env.JWT_RT_SECRET },
      ),
    ]);
    return { accessToken: at, refreshToken: rt };
  }
}
