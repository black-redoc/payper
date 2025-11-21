/* eslint-disable @typescript-eslint/no-explicit-any */
import { CompanyRepository } from '@/domain/repositories/CompanyRepository';
import { CompanyEntity } from '@/domain/entities/Company';
import { LocalStorageService } from '../storage/LocalStorage';

const STORAGE_KEY = 'invoice_app_company';

export class LocalStorageCompanyRepository implements CompanyRepository {
  async save(company: CompanyEntity): Promise<CompanyEntity> {
    const serializedCompany = this.serializeCompany(company);
    LocalStorageService.set(STORAGE_KEY, serializedCompany);
    return company;
  }

  async findById(id: string): Promise<CompanyEntity | null> {
    const data = LocalStorageService.get<any>(STORAGE_KEY);
    if (!data || data.id !== id) return null;

    return this.deserializeCompany(data);
  }

  async findFirst(): Promise<CompanyEntity | null> {
    const data = LocalStorageService.get<any>(STORAGE_KEY);
    if (!data) return null;

    return this.deserializeCompany(data);
  }

  async update(company: CompanyEntity): Promise<CompanyEntity> {
    company.updatedAt = new Date();
    return this.save(company);
  }

  async delete(id: string): Promise<void> {
    LocalStorageService.remove(STORAGE_KEY);
  }

  private serializeCompany(company: CompanyEntity): any {
    return {
      id: company.id,
      createdAt: company.createdAt.toISOString(),
      updatedAt: company.updatedAt.toISOString(),
      name: company.name,
      address: company.address,
      phone: company.phone,
      email: company.email,
      website: company.website,
      taxId: company.taxId,
      logo: company.logo,
      tipPercentage: company.tipPercentage,
      tipEnabled: company.tipEnabled
    };
  }

  private deserializeCompany(data: any): CompanyEntity {
    return new CompanyEntity(
      data.id,
      new Date(data.createdAt),
      new Date(data.updatedAt),
      data.name,
      data.tipPercentage,
      data.tipEnabled,
      data.address,
      data.phone,
      data.email,
      data.website,
      data.taxId,
      data.logo
    );
  }
}