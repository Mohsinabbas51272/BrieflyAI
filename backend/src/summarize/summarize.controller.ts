import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SummarizeService } from './summarize.service';
import { SummarizeUrlDto, SummarizeYoutubeDto } from './dto/summarize.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('summarize')
@UseGuards(JwtAuthGuard)
export class SummarizeController {
  constructor(private summarizeService: SummarizeService) {}

  @Post('url')
  summarizeUrl(@Req() req, @Body() dto: SummarizeUrlDto) {
    return this.summarizeService.summarizeUrl(req.user.id, dto.url, {
      modelPreference: dto.modelPreference,
      summaryLength: dto.summaryLength,
      tone: dto.tone,
    });
  }

  @Post('youtube')
  summarizeYoutube(@Req() req, @Body() dto: SummarizeYoutubeDto) {
    return this.summarizeService.summarizeYoutube(req.user.id, dto.url, {
      modelPreference: dto.modelPreference,
      summaryLength: dto.summaryLength,
      tone: dto.tone,
    });
  }

  @Post('pdf')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 15 * 1024 * 1024, // 15MB limit
      },
    })
  )
  summarizePdf(
    @Req() req,
    @UploadedFile() file: Express.Multer.File,
    @Body('modelPreference') modelPreference?: string,
    @Body('summaryLength') summaryLength?: string,
    @Body('tone') tone?: string,
  ) {
    if (!file) {
      throw new BadRequestException('Please upload a PDF file');
    }
    if (!file.mimetype.includes('pdf') && !file.originalname.toLowerCase().endsWith('.pdf')) {
      throw new BadRequestException('Only PDF files are supported');
    }

    return this.summarizeService.summarizePdf(req.user.id, file.buffer, file.originalname, {
      modelPreference,
      summaryLength,
      tone,
    });
  }
}
