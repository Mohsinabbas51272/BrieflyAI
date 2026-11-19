import { Injectable, BadRequestException } from '@nestjs/common';
import * as pdfParse from 'pdf-parse';

@Injectable()
export class PdfExtractorService {
  async extractFromBuffer(buffer: Buffer, originalFilename?: string): Promise<{ title: string; content: string; wordCount: number; pages: number }> {
    if (!buffer || buffer.length === 0) {
      throw new BadRequestException('Empty PDF file received');
    }

    try {
      const data = await pdfParse(buffer);

      const rawText = data.text || '';
      const cleaned = rawText
        .replace(/\r/g, '')
        .replace(/\t/g, ' ')
        .replace(/[ ]{2,}/g, ' ')
        .replace(/\n\s*\n/g, '\n\n')
        .trim();

      if (cleaned.length < 50) {
        throw new BadRequestException(
          'Could not extract text from this PDF. It may be a scanned image-only PDF without embedded text.'
        );
      }

      // Determine a good title
      let title = originalFilename ? originalFilename.replace(/\.[^/.]+$/, '') : 'PDF Document Summary';
      if (data.info && data.info.Title && data.info.Title.trim().length > 2) {
        title = data.info.Title.trim();
      } else {
        // Look at first line
        const firstLine = cleaned.split('\n')[0]?.trim();
        if (firstLine && firstLine.length > 5 && firstLine.length < 120) {
          title = firstLine;
        }
      }

      const wordCount = cleaned.split(/\s+/).filter(Boolean).length;

      return {
        title,
        content: cleaned,
        wordCount,
        pages: data.numpages || 1,
      };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException(`Failed to parse PDF document: ${error.message}`);
    }
  }
}
