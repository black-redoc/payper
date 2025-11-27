/* eslint-disable @typescript-eslint/no-explicit-any */
import { InvoiceRepository } from '@/domain/repositories/InvoiceRepository';
import { InvoiceEntity } from '@/domain/entities/Invoice';
import { CompanyEntity } from '@/domain/entities/Company';
import { ClientEntity } from '@/domain/entities/Client';
import { InvoiceItemEntity } from '@/domain/entities/InvoiceItem';
import { getPrisma } from '../database/prisma';

export class PrismaInvoiceRepository implements InvoiceRepository {
  async save(invoice: InvoiceEntity): Promise<InvoiceEntity> {
    const prisma = await getPrisma();
    const created = await prisma.invoice.create({
      data: {
        id: invoice.id,
        createdAt: invoice.createdAt,
        updatedAt: invoice.updatedAt,
        number: invoice.number,
        status: invoice.status,
        companyId: invoice.company.id,
        clientId: invoice.client?.id,
        subtotalAmount: invoice.subtotal.amount,
        subtotalCurrency: invoice.subtotal.currency,
        tipAmount: invoice.tipAmount.amount,
        tipCurrency: invoice.tipAmount.currency,
        totalAmount: invoice.total.amount,
        totalCurrency: invoice.total.currency,
        notes: invoice.notes,
        dueDate: invoice.dueDate,
        items: {
          create: invoice.items.map((item) => ({
            id: item.id,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
            description: item.description,
            quantity: item.quantity,
            unitPriceAmount: item.unitPrice.amount,
            unitPriceCurrency: item.unitPrice.currency,
            totalAmount: item.total.amount,
            totalCurrency: item.total.currency,
          })),
        },
      },
      include: {
        company: true,
        client: true,
        items: true,
      },
    });

    return this.mapToEntity(created);
  }

  async findById(id: string): Promise<InvoiceEntity | null> {
    const prisma = await getPrisma();
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        company: true,
        client: true,
        items: true,
      },
    });

    return invoice ? this.mapToEntity(invoice) : null;
  }

  async findAll(): Promise<InvoiceEntity[]> {
    const prisma = await getPrisma();
    const invoices = await prisma.invoice.findMany({
      include: {
        company: true,
        client: true,
        items: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return invoices.map((invoice) => this.mapToEntity(invoice));
  }

  async findRecent(limit: number = 10): Promise<InvoiceEntity[]> {
    const prisma = await getPrisma();
    const invoices = await prisma.invoice.findMany({
      take: limit,
      include: {
        company: true,
        client: true,
        items: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return invoices.map((invoice) => this.mapToEntity(invoice));
  }

  async update(invoice: InvoiceEntity): Promise<InvoiceEntity> {
    const prisma = await getPrisma();
    // Primero eliminar los items existentes
    await prisma.invoiceItem.deleteMany({
      where: { invoiceId: invoice.id },
    });

    // Actualizar la factura con los nuevos items
    const updated = await prisma.invoice.update({
      where: { id: invoice.id },
      data: {
        updatedAt: invoice.updatedAt,
        number: invoice.number,
        status: invoice.status,
        companyId: invoice.company.id,
        clientId: invoice.client?.id,
        subtotalAmount: invoice.subtotal.amount,
        subtotalCurrency: invoice.subtotal.currency,
        tipAmount: invoice.tipAmount.amount,
        tipCurrency: invoice.tipAmount.currency,
        totalAmount: invoice.total.amount,
        totalCurrency: invoice.total.currency,
        notes: invoice.notes,
        dueDate: invoice.dueDate,
        items: {
          create: invoice.items.map((item) => ({
            id: item.id,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
            description: item.description,
            quantity: item.quantity,
            unitPriceAmount: item.unitPrice.amount,
            unitPriceCurrency: item.unitPrice.currency,
            totalAmount: item.total.amount,
            totalCurrency: item.total.currency,
          })),
        },
      },
      include: {
        company: true,
        client: true,
        items: true,
      },
    });

    return this.mapToEntity(updated);
  }

  async delete(id: string): Promise<void> {
    const prisma = await getPrisma();
    await prisma.invoice.delete({
      where: { id },
    });
  }

  private mapToEntity(data: any): InvoiceEntity {
    const company = new CompanyEntity(
      data.company.id,
      data.company.createdAt,
      data.company.updatedAt,
      data.company.name,
      data.company.tipPercentage,
      data.company.tipEnabled,
      data.company.address,
      data.company.phone,
      data.company.email,
      data.company.website,
      data.company.taxId,
      data.company.logo
    );

    const client = data.client
      ? new ClientEntity(
          data.client.id,
          data.client.createdAt,
          data.client.updatedAt,
          data.client.firstName,
          data.client.lastName,
          data.client.email,
          data.client.identificationType,
          data.client.identificationNumber
        )
      : undefined;

    const items = data.items.map(
      (item: any) =>
        new InvoiceItemEntity(
          item.id,
          item.createdAt,
          item.updatedAt,
          item.description,
          item.quantity,
          { amount: item.unitPriceAmount, currency: item.unitPriceCurrency },
          { amount: item.totalAmount, currency: item.totalCurrency }
        )
    );

    return new InvoiceEntity(
      data.id,
      data.createdAt,
      data.updatedAt,
      data.number,
      data.status,
      company,
      items,
      { amount: data.subtotalAmount, currency: data.subtotalCurrency },
      { amount: data.tipAmount, currency: data.tipCurrency },
      { amount: data.totalAmount, currency: data.totalCurrency },
      client,
      data.notes,
      data.dueDate
    );
  }
}
