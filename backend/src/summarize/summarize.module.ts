import { Module } from '@nestjs/common';
import { SummarizeController } from './summarize.controller';
import { SummarizeService } from './summarize.service';
import { UrlExtractorService } from './extractors/url-extractor.service';
import { YoutubeExtractorService } from './extractors/youtube-extractor.service';
import { PdfExtractorService } from './extractors/pdf-extractor.service';
import { AiService } from './ai/ai.service';

@Module({
  controllers: [SummarizeController],
  providers: [
    SummarizeService,
    UrlExtractorService,
    YoutubeExtractorService,
    PdfExtractorService,
    AiService,
  ],
  exports: [SummarizeService, AiService],
})
export class SummarizeModule {}
