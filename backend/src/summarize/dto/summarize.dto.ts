import { IsNotEmpty, IsUrl, IsOptional, IsString } from 'class-validator';

export class SummarizeUrlDto {
  @IsNotEmpty()
  @IsUrl()
  url: string;

  @IsOptional()
  @IsString()
  modelPreference?: string;

  @IsOptional()
  @IsString()
  summaryLength?: string;

  @IsOptional()
  @IsString()
  tone?: string;
}

export class SummarizeYoutubeDto {
  @IsNotEmpty()
  url: string;

  @IsOptional()
  @IsString()
  modelPreference?: string;

  @IsOptional()
  @IsString()
  summaryLength?: string;

  @IsOptional()
  @IsString()
  tone?: string;
}
