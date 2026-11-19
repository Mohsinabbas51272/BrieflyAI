import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { SummarizeModule } from './summarize/summarize.module';
import { HistoryModule } from './history/history.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { AdminModule } from './admin/admin.module';

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
})
export class AppModule {}
