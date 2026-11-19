import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcryptjs';
import { Plan, Role } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (existing) {
      throw new BadRequestException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        passwordHash,
        name: dto.name,
        role: Role.USER,
        plan: Plan.FREE,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        plan: true,
        dailyUsageCount: true,
      },
    });

    const token = this.generateToken(user.id, user.email);

    return {
      user,
      accessToken: token,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Reset daily count if date changed
    const now = new Date();
    const lastDate = new Date(user.lastUsageDate);
    let dailyUsageCount = user.dailyUsageCount;

    if (
      now.getFullYear() !== lastDate.getFullYear() ||
      now.getMonth() !== lastDate.getMonth() ||
      now.getDate() !== lastDate.getDate()
    ) {
      dailyUsageCount = 0;
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          dailyUsageCount: 0,
          lastUsageDate: now,
        },
      });
    }

    const token = this.generateToken(user.id, user.email);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        plan: user.plan,
        dailyUsageCount,
        geminiApiKey: user.geminiApiKey ? '••••••••' + user.geminiApiKey.slice(-4) : null,
        openaiApiKey: user.openaiApiKey ? '••••••••' + user.openaiApiKey.slice(-4) : null,
      },
      accessToken: token,
    };
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        plan: true,
        dailyUsageCount: true,
        lastUsageDate: true,
        geminiApiKey: true,
        openaiApiKey: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      ...user,
      geminiApiKey: user.geminiApiKey ? '••••••••' + user.geminiApiKey.slice(-4) : null,
      openaiApiKey: user.openaiApiKey ? '••••••••' + user.openaiApiKey.slice(-4) : null,
      hasGeminiKey: !!user.geminiApiKey,
      hasOpenaiKey: !!user.openaiApiKey,
    };
  }

  async updateApiKeys(userId: string, geminiKey?: string, openaiKey?: string) {
    const data: { geminiApiKey?: string | null; openaiApiKey?: string | null } = {};
    if (geminiKey !== undefined) data.geminiApiKey = geminiKey.trim() || null;
    if (openaiKey !== undefined) data.openaiApiKey = openaiKey.trim() || null;

    const user = await this.prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        plan: true,
        geminiApiKey: true,
        openaiApiKey: true,
      },
    });

    return {
      message: 'API Keys updated successfully',
      hasGeminiKey: !!user.geminiApiKey,
      hasOpenaiKey: !!user.openaiApiKey,
    };
  }

  private generateToken(userId: string, email: string): string {
    return this.jwtService.sign(
      { sub: userId, email },
      { expiresIn: '7d' },
    );
  }
}
