/* eslint-disable @typescript-eslint/no-explicit-any */
import { CompanyRepository } from '@/domain/repositories/CompanyRepository';
import { CompanyEntity } from '@/domain/entities/Company';
import prisma from '../database/prisma';

export class PrismaCompanyRepository implements CompanyRepository {
  async save(company: CompanyEntity): Promise<CompanyEntity> {
    const created = await prisma.company.create({
      data: {
        id: company.id,
        createdAt: company.createdAt,
        updatedAt: company.updatedAt,
        name: company.name,
        address: company.address,
        phone: company.phone,
        email: company.email,
        website: company.website,
        taxId: company.taxId,
        logo: company.logo,
        tipPercentage: company.tipPercentage,
        tipEnabled: company.tipEnabled,
      },
    });

    return this.mapToEntity(created);
  }

  async findById(id: string): Promise<CompanyEntity | null> {
    const company = await prisma.company.findUnique({
      where: { id },
    });

    return company ? this.mapToEntity(company) : null;
  }

  async findFirst(): Promise<CompanyEntity | null> {
    const company = await prisma.company.findFirst();

    return company ? this.mapToEntity(company) : null;
  }

  async update(company: CompanyEntity): Promise<CompanyEntity> {
    const updated = await prisma.company.update({
      where: { id: company.id },
      data: {
        updatedAt: company.updatedAt,
        name: company.name,
        address: company.address,
        phone: company.phone,
        email: company.email,
        website: company.website,
        taxId: company.taxId,
        logo: company.logo,
        tipPercentage: company.tipPercentage,
        tipEnabled: company.tipEnabled,
      },
    });

    return this.mapToEntity(updated);
  }

  async delete(id: string): Promise<void> {
    await prisma.company.delete({
      where: { id },
    });
  }

  private mapToEntity(data: any): CompanyEntity {
    return new CompanyEntity(
      data.id,
      data.createdAt,
      data.updatedAt,
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
