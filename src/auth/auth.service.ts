import { ForbiddenException, Injectable } from '@nestjs/common';
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

  async signinLocal(data: SignupUserDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: data.email,
      },
    });

    if (!user) {
      throw new ForbiddenException('Access denied');
    }

    const passwordMathces = await bcrypt.compare(data.password, user.hash);
    if (!passwordMathces) {
      throw new ForbiddenException('Access denied');
    }

    const tokens = await this.generateTokens(user.id, user.email);
    await this.updateRtHash(user.id, tokens.refreshToken);

    return tokens;
  }

  async logout(userId: string) {
    await this.prisma.user.updateMany({
      where: { id: userId, refreshToken: { not: null } },
      data: { refreshToken: null },
    });
  }

  async refreshTokens(userId: string, rt: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) throw new ForbiddenException('Access denied');

    const rtMatches = await bcrypt.compare(rt, user.refreshToken);

    if (!rtMatches) throw new ForbiddenException('Access denied');

    const tokens = await this.generateTokens(user.id, user.email);
    await this.updateRtHash(user.id, tokens.refreshToken);

    return tokens;
  }

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
