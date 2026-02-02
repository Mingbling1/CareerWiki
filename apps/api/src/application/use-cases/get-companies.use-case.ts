// ============================================
// APPLICATION - Use Cases: Get All Companies
// ============================================

import { Inject, Injectable } from '@nestjs/common';
import { Company } from '../../domain/entities';
import { ICompanyRepository, COMPANY_REPOSITORY } from '../../domain/repositories';

@Injectable()
export class GetCompaniesUseCase {
  constructor(
    @Inject(COMPANY_REPOSITORY)
    private readonly companyRepository: ICompanyRepository,
  ) {}

  async execute(): Promise<Company[]> {
    return this.companyRepository.findAll();
  }
}
