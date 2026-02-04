import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import {
  GetCompaniesUseCase,
  GetCompanyBySlugUseCase,
  CreateCompanyUseCase,
  UpdateCompanyUseCase,
} from '../../../application/use-cases';
import { CreateCompanyDto, UpdateCompanyDto } from '../dto';

@ApiTags('Companies')
@Controller('companies')
export class CompaniesController {
  constructor(
    private readonly getCompanies: GetCompaniesUseCase,
    private readonly getCompanyBySlug: GetCompanyBySlugUseCase,
    private readonly createCompany: CreateCompanyUseCase,
    private readonly updateCompany: UpdateCompanyUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all companies' })
  @ApiResponse({ status: 200, description: 'List of companies' })
  async findAll() {
    return this.getCompanies.execute();
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new company' })
  @ApiBody({ type: CreateCompanyDto })
  @ApiResponse({ status: 201, description: 'Company created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 409, description: 'Company slug already exists' })
  async create(@Body() dto: CreateCompanyDto) {
    return this.createCompany.execute({
      name: dto.name,
      slug: dto.slug,
      description: dto.description,
      industry: dto.industry,
      size: dto.size,
      location: dto.location,
      website: dto.website,
      culture: dto.culture,
      benefits: dto.benefits,
      logo: dto.logo,
    });
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an existing company' })
  @ApiBody({ type: UpdateCompanyDto })
  @ApiResponse({ status: 200, description: 'Company updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 404, description: 'Company not found' })
  @ApiResponse({ status: 409, description: 'Company slug already exists' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCompanyDto,
  ) {
    return this.updateCompany.execute(id, {
      name: dto.name,
      slug: dto.slug,
      description: dto.description,
      industry: dto.industry,
      size: dto.size,
      location: dto.location,
      website: dto.website,
      culture: dto.culture,
      benefits: dto.benefits,
      logo: dto.logo,
      removeLogo: dto.removeLogo,
    });
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get company by slug' })
  @ApiResponse({ status: 200, description: 'Company details' })
  @ApiResponse({ status: 404, description: 'Company not found' })
  async findBySlug(@Param('slug') slug: string) {
    return this.getCompanyBySlug.execute(slug);
  }
}
