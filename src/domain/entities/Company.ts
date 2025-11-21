import { BaseEntity } from '@/shared/types';

export interface Company extends BaseEntity {
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  taxId?: string;
  logo?: string;
  tipPercentage: number;
  tipEnabled: boolean;
}

export class CompanyEntity implements Company {
  constructor(
    public id: string,
    public createdAt: Date,
    public updatedAt: Date,
    public name: string,
    public tipPercentage: number = 10,
    public tipEnabled: boolean = true,
    public address?: string,
    public phone?: string,
    public email?: string,
    public website?: string,
    public taxId?: string,
    public logo?: string
  ) {}

  get isComplete(): boolean {
    return !!this.name;
  }

  updateTipSettings(percentage: number, enabled: boolean): void {
    this.tipPercentage = Math.max(0, Math.min(100, percentage));
    this.tipEnabled = enabled;
    this.updatedAt = new Date();
  }

  static create(data: Partial<Company> & { name: string }): CompanyEntity {
    const now = new Date();
    return new CompanyEntity(
      data.id || crypto.randomUUID(),
      data.createdAt || now,
      data.updatedAt || now,
      data.name,
      data.tipPercentage ?? 10,
      data.tipEnabled ?? true,
      data.address,
      data.phone,
      data.email,
      data.website,
      data.taxId,
      data.logo
    );
  }
}