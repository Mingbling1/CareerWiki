import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Company } from '../../../domain/entities';
import { ICompanyRepository } from '../../../domain/repositories';

@Injectable()
export class CompanyRepositoryImpl implements ICompanyRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<Company[]> {
    const companies = await this.prisma.company.findMany({
      orderBy: { name: 'asc' },
    });
    return companies.map(this.toDomain);
  }

  async findById(id: string): Promise<Company | null> {
    const company = await this.prisma.company.findUnique({ where: { id } });
    return company ? this.toDomain(company) : null;
  }

  async findBySlug(slug: string): Promise<Company | null> {
    const company = await this.prisma.company.findUnique({ where: { slug } });
    return company ? this.toDomain(company) : null;
  }

  async create(data: Partial<Company>): Promise<Company> {
    const company = await this.prisma.company.create({
      data: {
        name: data.name!,
        slug: data.slug!,
        description: data.description,
        industry: data.industry,
        size: data.size,
        location: data.location,
        website: data.website,
        logoUrl: data.logoUrl,
        culture: data.culture,
        benefits: data.benefits || [],
      },
    });
    return this.toDomain(company);
  }

  async update(id: string, data: Partial<Company>): Promise<Company> {
    const company = await this.prisma.company.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        industry: data.industry,
        size: data.size,
        location: data.location,
        website: data.website,
        logoUrl: data.logoUrl,
        culture: data.culture,
        benefits: data.benefits,
      },
    });
    return this.toDomain(company);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.company.delete({ where: { id } });
  }

  async search(query: string): Promise<Company[]> {
    const companies = await this.prisma.company.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { industry: { contains: query, mode: 'insensitive' } },
        ],
      },
    });
    return companies.map(this.toDomain);
  }

  private toDomain(data: any): Company {
    return Company.create({
      id: data.id,
      name: data.name,
      slug: data.slug,
      description: data.description,
      industry: data.industry,
      size: data.size,
      location: data.location,
      website: data.website,
      logoUrl: data.logoUrl,
      culture: data.culture,
      benefits: data.benefits,
      isVerified: data.isVerified,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }
}
