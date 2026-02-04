// ============================================
// HTTP - DTOs: Company
// ============================================

import {
  IsString,
  IsOptional,
  IsArray,
  IsUrl,
  IsEnum,
  MaxLength,
  MinLength,
  Matches,
  IsBoolean,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// Company size options
export enum CompanySize {
  STARTUP = '1-10',
  SMALL = '11-50',
  MEDIUM = '51-200',
  LARGE = '201-500',
  ENTERPRISE = '500+',
}

// Logo upload nested DTO
export class LogoUploadDto {
  @ApiProperty({
    description: 'Base64 encoded image data',
    example: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUg...',
  })
  @IsString()
  data: string;

  @ApiProperty({
    description: 'Original file name',
    example: 'company-logo.png',
  })
  @IsString()
  @MaxLength(255)
  fileName: string;
}

// ============================================
// CREATE COMPANY DTO
// ============================================
export class CreateCompanyDto {
  @ApiProperty({
    description: 'Company name',
    example: 'TechCorp Solutions',
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @MinLength(2, { message: 'Company name must be at least 2 characters' })
  @MaxLength(100, { message: 'Company name cannot exceed 100 characters' })
  name: string;

  @ApiPropertyOptional({
    description: 'URL-friendly slug (auto-generated from name if not provided)',
    example: 'techcorp-solutions',
    pattern: '^[a-z0-9]+(?:-[a-z0-9]+)*$',
  })
  @IsOptional()
  @IsString()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'Slug must be lowercase alphanumeric with hyphens only',
  })
  @MaxLength(100)
  slug?: string;

  @ApiPropertyOptional({
    description: 'Company description',
    example: 'Leading technology solutions provider in Latin America',
    maxLength: 2000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000, { message: 'Description cannot exceed 2000 characters' })
  description?: string;

  @ApiPropertyOptional({
    description: 'Industry sector',
    example: 'Technology',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  industry?: string;

  @ApiPropertyOptional({
    description: 'Company size range',
    enum: CompanySize,
    example: CompanySize.MEDIUM,
  })
  @IsOptional()
  @IsEnum(CompanySize, {
    message: 'Size must be one of: 1-10, 11-50, 51-200, 201-500, 500+',
  })
  size?: string;

  @ApiPropertyOptional({
    description: 'Company location/headquarters',
    example: 'Lima, Perú',
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  location?: string;

  @ApiPropertyOptional({
    description: 'Company website URL',
    example: 'https://techcorp.com',
  })
  @IsOptional()
  @IsUrl({}, { message: 'Website must be a valid URL' })
  website?: string;

  @ApiPropertyOptional({
    description: 'Company culture description',
    example: 'We foster innovation and work-life balance',
    maxLength: 2000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  culture?: string;

  @ApiPropertyOptional({
    description: 'List of company benefits',
    example: ['Remote work', 'Health insurance', 'Stock options'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(100, { each: true })
  benefits?: string[];

  @ApiPropertyOptional({
    description: 'Company logo upload',
    type: LogoUploadDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => LogoUploadDto)
  logo?: LogoUploadDto;
}

// ============================================
// UPDATE COMPANY DTO
// ============================================
export class UpdateCompanyDto {
  @ApiPropertyOptional({
    description: 'Company name',
    example: 'TechCorp Solutions',
    minLength: 2,
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Company name must be at least 2 characters' })
  @MaxLength(100, { message: 'Company name cannot exceed 100 characters' })
  name?: string;

  @ApiPropertyOptional({
    description: 'URL-friendly slug',
    example: 'techcorp-solutions',
    pattern: '^[a-z0-9]+(?:-[a-z0-9]+)*$',
  })
  @IsOptional()
  @IsString()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'Slug must be lowercase alphanumeric with hyphens only',
  })
  @MaxLength(100)
  slug?: string;

  @ApiPropertyOptional({
    description: 'Company description',
    example: 'Leading technology solutions provider in Latin America',
    maxLength: 2000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000, { message: 'Description cannot exceed 2000 characters' })
  description?: string;

  @ApiPropertyOptional({
    description: 'Industry sector',
    example: 'Technology',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  industry?: string;

  @ApiPropertyOptional({
    description: 'Company size range',
    enum: CompanySize,
    example: CompanySize.MEDIUM,
  })
  @IsOptional()
  @IsEnum(CompanySize, {
    message: 'Size must be one of: 1-10, 11-50, 51-200, 201-500, 500+',
  })
  size?: string;

  @ApiPropertyOptional({
    description: 'Company location/headquarters',
    example: 'Lima, Perú',
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  location?: string;

  @ApiPropertyOptional({
    description: 'Company website URL',
    example: 'https://techcorp.com',
  })
  @IsOptional()
  @IsUrl({}, { message: 'Website must be a valid URL' })
  website?: string;

  @ApiPropertyOptional({
    description: 'Company culture description',
    example: 'We foster innovation and work-life balance',
    maxLength: 2000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  culture?: string;

  @ApiPropertyOptional({
    description: 'List of company benefits',
    example: ['Remote work', 'Health insurance', 'Stock options'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(100, { each: true })
  benefits?: string[];

  @ApiPropertyOptional({
    description: 'Company logo upload',
    type: LogoUploadDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => LogoUploadDto)
  logo?: LogoUploadDto;

  @ApiPropertyOptional({
    description: 'Remove the current logo',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  removeLogo?: boolean;
}
