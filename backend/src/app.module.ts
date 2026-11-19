import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Controller, Get } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { SummarizeModule } from './summarize/summarize.module';
import { HistoryModule } from './history/history.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { AdminModule } from './admin/admin.module';

@Controller()
class HealthController {
  @Get('health')
  health() {
    return { status: 'ok', service: 'BrieflyAI', timestamp: new Date().toISOString() };
  }
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    AuthModule,
    SummarizeModule,
    HistoryModule,
    SubscriptionModule,
    AdminModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
