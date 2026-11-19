import {
  Controller,
  Get,
  Delete,
  Patch,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { HistoryService } from './history.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Role } from '@prisma/client';

@Controller('history')
@UseGuards(JwtAuthGuard)
export class HistoryController {
  constructor(private historyService: HistoryService) {}

  @Get()
  listSummaries(
    @Req() req,
    @Query('search') search?: string,
    @Query('sourceType') sourceType?: string,
    @Query('isFavorite') isFavorite?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.historyService.listSummaries(req.user.id, {
      search,
      sourceType,
      isFavorite,
      page,
      limit,
    });
  }

  @Get(':id')
  getSummaryById(@Req() req, @Param('id') id: string) {
    const isAdmin = req.user.role === Role.ADMIN;
    return this.historyService.getSummaryById(req.user.id, id, isAdmin);
  }

  @Patch(':id/favorite')
  toggleFavorite(@Req() req, @Param('id') id: string) {
    return this.historyService.toggleFavorite(req.user.id, id);
  }

  @Delete(':id')
  deleteSummary(@Req() req, @Param('id') id: string) {
    const isAdmin = req.user.role === Role.ADMIN;
    return this.historyService.deleteSummary(req.user.id, id, isAdmin);
  }
}
