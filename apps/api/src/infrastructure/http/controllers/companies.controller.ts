import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { GetCompaniesUseCase, GetCompanyBySlugUseCase } from '../../../application/use-cases';

@ApiTags('Companies')
@Controller('companies')
export class CompaniesController {
  constructor(
    private readonly getCompanies: GetCompaniesUseCase,
    private readonly getCompanyBySlug: GetCompanyBySlugUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all companies' })
  async findAll() {
    return this.getCompanies.execute();
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get company by slug' })
  async findBySlug(@Param('slug') slug: string) {
    return this.getCompanyBySlug.execute(slug);
  }
}
