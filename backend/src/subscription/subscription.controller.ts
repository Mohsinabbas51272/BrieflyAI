import { Controller, Get, Post, UseGuards, Req } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('subscription')
export class SubscriptionController {
  constructor(private subscriptionService: SubscriptionService) {}

  @Get('plans')
  getPlans() {
    return this.subscriptionService.getPlans();
  }

  @UseGuards(JwtAuthGuard)
  @Get('status')
  getStatus(@Req() req) {
    return this.subscriptionService.getStatus(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('upgrade')
  upgradeToPro(@Req() req) {
    return this.subscriptionService.upgradeToPro(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('downgrade')
  downgradeToFree(@Req() req) {
    return this.subscriptionService.downgradeToFree(req.user.id);
  }
}
