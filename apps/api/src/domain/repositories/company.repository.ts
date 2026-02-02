// ============================================
// DOMAIN - Repository Interfaces (Ports)
// ============================================

import { Company } from '../entities/company.entity';

export interface ICompanyRepository {
  findAll(): Promise<Company[]>;
  findById(id: string): Promise<Company | null>;
  findBySlug(slug: string): Promise<Company | null>;
  create(company: Partial<Company>): Promise<Company>;
  update(id: string, company: Partial<Company>): Promise<Company>;
  delete(id: string): Promise<void>;
  search(query: string): Promise<Company[]>;
}

export const COMPANY_REPOSITORY = 'COMPANY_REPOSITORY';
