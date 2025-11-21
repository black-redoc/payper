import { CompanyEntity } from '../entities/Company';
import { CompanyRepository } from '../repositories/CompanyRepository';

export class CompanyService {
  constructor(private companyRepository: CompanyRepository) {}

  async getCompany(): Promise<CompanyEntity | null> {
    return this.companyRepository.findFirst();
  }

  async createCompany(data: {
    name: string;
    address?: string;
    phone?: string;
    email?: string;
    website?: string;
    taxId?: string;
    logo?: string;
    tipPercentage?: number;
    tipEnabled?: boolean;
  }): Promise<CompanyEntity> {
    const company = CompanyEntity.create(data);
    return this.companyRepository.save(company);
  }

  async updateCompany(
    companyId: string,
    updates: Partial<CompanyEntity>
  ): Promise<CompanyEntity> {
    const company = await this.companyRepository.findById(companyId);
    if (!company) {
      throw new Error('Company not found');
    }

    Object.assign(company, updates);
    company.updatedAt = new Date();

    return this.companyRepository.update(company);
  }

  async updateTipSettings(
    companyId: string,
    tipPercentage: number,
    tipEnabled: boolean
  ): Promise<CompanyEntity> {
    const company = await this.companyRepository.findById(companyId);
    if (!company) {
      throw new Error('Company not found');
    }

    company.updateTipSettings(tipPercentage, tipEnabled);
    return this.companyRepository.update(company);
  }

  async hasCompanyData(): Promise<boolean> {
    const company = await this.getCompany();
    return company?.isComplete ?? false;
  }
}