import { Injectable, BadRequestException } from '@nestjs/common';
import axios from 'axios';
import { YoutubeTranscript } from 'youtube-transcript';

@Injectable()
export class YoutubeExtractorService {
  extractVideoId(url: string): string {
    if (!url) {
      throw new BadRequestException('YouTube URL is required');
    }

    const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regExp);

    if (match && match[1]) {
      return match[1];
    }

    throw new BadRequestException('Could not parse valid YouTube Video ID from provided URL');
  }

  async extractTranscript(url: string): Promise<{ title: string; content: string; wordCount: number; videoId: string }> {
    const videoId = this.extractVideoId(url);

    // 1. Fetch Video Title via YouTube oEmbed API
    let title = 'YouTube Video Summary';
    try {
      const oembedRes = await axios.get(
        `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`,
        { timeout: 8000 }
      );
      if (oembedRes.data && oembedRes.data.title) {
        title = oembedRes.data.title;
      }
    } catch {
      // Continue with default title if oEmbed fails
    }

    // 2. Fetch Transcript
    try {
      const transcriptList = await YoutubeTranscript.fetchTranscript(videoId);

      if (!transcriptList || transcriptList.length === 0) {
        throw new Error('Empty transcript received');
      }

      // Combine transcript segments
      const fullText = transcriptList
        .map((item) => item.text)
        .join(' ')
        .replace(/&amp;/g, '&')
        .replace(/&#39;/g, "'")
        .replace(/&quot;/g, '"')
        .replace(/\s+/g, ' ')
        .trim();

      if (fullText.length < 50) {
        throw new BadRequestException('Extracted transcript is too short to summarize');
      }

      const wordCount = fullText.split(/\s+/).filter(Boolean).length;

      return {
        title,
        content: fullText,
        wordCount,
        videoId,
      };
    } catch (transcriptError) {
      // If transcript is disabled or not available for this video
      throw new BadRequestException(
        `Could not retrieve YouTube video transcript: ${transcriptError.message || 'Transcripts are disabled or unavailable for this video'}. Please ensure the video has closed captions (CC) enabled.`
      );
    }
  }
}
