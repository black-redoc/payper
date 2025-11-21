/* eslint-disable @typescript-eslint/no-explicit-any */
import { InvoiceRepository } from '@/domain/repositories/InvoiceRepository';
import { InvoiceEntity } from '@/domain/entities/Invoice';
import { ClientEntity } from '@/domain/entities/Client';
import { CompanyEntity } from '@/domain/entities/Company';
import { InvoiceItemEntity } from '@/domain/entities/InvoiceItem';
import { LocalStorageService } from '../storage/LocalStorage';

const STORAGE_KEY = 'invoice_app_invoices';

export class LocalStorageInvoiceRepository implements InvoiceRepository {
  async save(invoice: InvoiceEntity): Promise<InvoiceEntity> {
    const invoices = await this.getAll();
    const serializedInvoice = this.serializeInvoice(invoice);

    const existingIndex = invoices.findIndex(inv => inv.id === invoice.id);
    if (existingIndex >= 0) {
      invoices[existingIndex] = serializedInvoice;
    } else {
      invoices.push(serializedInvoice);
    }

    LocalStorageService.set(STORAGE_KEY, invoices);
    return invoice;
  }

  async findById(id: string): Promise<InvoiceEntity | null> {
    const invoices = await this.getAll();
    const invoiceData = invoices.find(inv => inv.id === id);
    return invoiceData ? this.deserializeInvoice(invoiceData) : null;
  }

  async findAll(): Promise<InvoiceEntity[]> {
    const invoices = await this.getAll();
    return invoices.map(data => this.deserializeInvoice(data));
  }

  async findRecent(limit: number = 10): Promise<InvoiceEntity[]> {
    const invoices = await this.findAll();
    return invoices
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      .slice(0, limit);
  }

  async update(invoice: InvoiceEntity): Promise<InvoiceEntity> {
    invoice.updatedAt = new Date();
    return this.save(invoice);
  }

  async delete(id: string): Promise<void> {
    const invoices = await this.getAll();
    const filteredInvoices = invoices.filter(inv => inv.id !== id);
    LocalStorageService.set(STORAGE_KEY, filteredInvoices);
  }

  private async getAll(): Promise<any[]> {
    return LocalStorageService.get<any[]>(STORAGE_KEY) || [];
  }

  private serializeInvoice(invoice: InvoiceEntity): any {
    return {
      id: invoice.id,
      createdAt: invoice.createdAt.toISOString(),
      updatedAt: invoice.updatedAt.toISOString(),
      number: invoice.number,
      status: invoice.status,
      company: this.serializeCompany(invoice.company),
      client: invoice.client ? this.serializeClient(invoice.client) : null,
      items: invoice.items.map(item => this.serializeItem(item)),
      subtotal: invoice.subtotal,
      tipAmount: invoice.tipAmount,
      total: invoice.total,
      notes: invoice.notes,
      dueDate: invoice.dueDate ? invoice.dueDate.toISOString() : null
    };
  }

  private deserializeInvoice(data: any): InvoiceEntity {
    const company = this.deserializeCompany(data.company);
    const client = data.client ? this.deserializeClient(data.client) : undefined;
    const items = data.items.map((item: any) => this.deserializeItem(item));

    return new InvoiceEntity(
      data.id,
      new Date(data.createdAt),
      new Date(data.updatedAt),
      data.number,
      data.status,
      company,
      items,
      data.subtotal,
      data.tipAmount,
      data.total,
      client,
      data.notes,
      data.dueDate ? new Date(data.dueDate) : undefined
    );
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

  private serializeClient(client: ClientEntity): any {
    return {
      id: client.id,
      createdAt: client.createdAt.toISOString(),
      updatedAt: client.updatedAt.toISOString(),
      firstName: client.firstName,
      lastName: client.lastName,
      email: client.email,
      identificationType: client.identificationType,
      identificationNumber: client.identificationNumber
    };
  }

  private deserializeClient(data: any): ClientEntity {
    return new ClientEntity(
      data.id,
      new Date(data.createdAt),
      new Date(data.updatedAt),
      data.firstName,
      data.lastName,
      data.email,
      data.identificationType,
      data.identificationNumber
    );
  }

  private serializeItem(item: InvoiceItemEntity): any {
    return {
      id: item.id,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      total: item.total
    };
  }

  private deserializeItem(data: any): InvoiceItemEntity {
    return new InvoiceItemEntity(
      data.id,
      new Date(data.createdAt),
      new Date(data.updatedAt),
      data.description,
      data.quantity,
      data.unitPrice,
      data.total
    );
  }
}