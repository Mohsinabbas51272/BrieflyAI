import { Injectable, BadRequestException } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';

@Injectable()
export class UrlExtractorService {
  async extractFromUrl(url: string): Promise<{ title: string; content: string; wordCount: number }> {
    if (!url || !url.startsWith('http')) {
      throw new BadRequestException('Please provide a valid HTTP or HTTPS URL');
    }

    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          Accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        timeout: 15000,
        maxRedirects: 5,
      });

      const html = response.data;
      if (typeof html !== 'string') {
        throw new BadRequestException('Invalid response received from URL');
      }

      const $ = cheerio.load(html);

      // Remove noise elements
      $(
        'script, style, nav, footer, header, aside, noscript, iframe, svg, [role="navigation"], [role="banner"], [role="alert"], .ad, .ads, .sidebar, .cookie-consent, .modal, .popup'
      ).remove();

      // Extract title
      let title =
        $('meta[property="og:title"]').attr('content') ||
        $('meta[name="twitter:title"]').attr('content') ||
        $('h1').first().text().trim() ||
        $('title').text().trim() ||
        'Article Summary';

      title = title.replace(/\s+/g, ' ').trim();

      // Extract main text: prioritize article or main containers
      let textContent = '';
      const mainSelectors = ['article', 'main', '[role="main"]', '.post-content', '.article-body', '.entry-content'];

      for (const selector of mainSelectors) {
        if ($(selector).length > 0) {
          textContent = $(selector).text();
          if (textContent.trim().length > 300) break;
        }
      }

      if (!textContent || textContent.trim().length < 300) {
        // Collect paragraphs
        const paragraphs: string[] = [];
        $('p').each((_, el) => {
          const pText = $(el).text().replace(/\s+/g, ' ').trim();
          if (pText.length > 40) {
            paragraphs.push(pText);
          }
        });
        textContent = paragraphs.join('\n\n');
      }

      // If still small, fallback to body text
      if (!textContent || textContent.trim().length < 150) {
        textContent = $('body').text();
      }

      // Clean whitespace
      const cleaned = textContent
        .replace(/\t/g, ' ')
        .replace(/\r/g, '')
        .replace(/\n\s*\n/g, '\n\n')
        .replace(/[ ]{2,}/g, ' ')
        .trim();

      if (cleaned.length < 100) {
        throw new BadRequestException(
          'Could not extract meaningful article content from this webpage. It may require login or client-side rendering.'
        );
      }

      const wordCount = cleaned.split(/\s+/).filter(Boolean).length;

      return {
        title,
        content: cleaned,
        wordCount,
      };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException(
        `Failed to fetch URL content: ${error.message || 'Network error or access restricted'}`
      );
    }
  }
}
