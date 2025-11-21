import { CompanyEntity } from '../entities/Company';

export interface CompanyRepository {
  save(company: CompanyEntity): Promise<CompanyEntity>;
  findById(id: string): Promise<CompanyEntity | null>;
  findFirst(): Promise<CompanyEntity | null>;
  update(company: CompanyEntity): Promise<CompanyEntity>;
  delete(id: string): Promise<void>;
}