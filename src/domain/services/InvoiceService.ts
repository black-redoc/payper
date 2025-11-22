import { InvoiceEntity, InvoiceStatus } from '../entities/Invoice';
import { InvoiceItemEntity } from '../entities/InvoiceItem';
import { ClientEntity } from '../entities/Client';
import { InvoiceRepository } from '../repositories/InvoiceRepository';
import { CompanyRepository } from '../repositories/CompanyRepository';
import { Money } from '@/shared/types';

export class InvoiceService {
  constructor(
    private invoiceRepository: InvoiceRepository,
    private companyRepository: CompanyRepository
  ) {}

  async createInvoice(client?: ClientEntity): Promise<InvoiceEntity> {
    const company = await this.companyRepository.findFirst();
    if (!company) {
      throw new Error(
        'No company found. Please set up company information first.'
      );
    }

    const invoice = InvoiceEntity.create({
      company,
      client,
    });

    return this.invoiceRepository.save(invoice);
  }

  async addItemToInvoice(
    invoiceId: string,
    description: string,
    quantity: number,
    unitPrice: Money
  ): Promise<InvoiceEntity> {
    const invoice = await this.invoiceRepository.findById(invoiceId);
    if (!invoice) {
      throw new Error('Invoice not found');
    }

    const item = InvoiceItemEntity.create({
      description,
      quantity,
      unitPrice,
    });

    invoice.addItem(item);
    return this.invoiceRepository.update(invoice);
  }

  async removeItemFromInvoice(
    invoiceId: string,
    itemId: string
  ): Promise<InvoiceEntity> {
    const invoice = await this.invoiceRepository.findById(invoiceId);
    if (!invoice) {
      throw new Error('Invoice not found');
    }

    invoice.removeItem(itemId);
    return this.invoiceRepository.update(invoice);
  }

  async updateItemInInvoice(
    invoiceId: string,
    itemId: string,
    description: string,
    quantity: number,
    unitPrice: Money
  ): Promise<InvoiceEntity> {
    const invoice = await this.invoiceRepository.findById(invoiceId);
    if (!invoice) {
      throw new Error('Invoice not found');
    }

    const item = invoice.items.find((i) => i.id === itemId);
    if (!item) {
      throw new Error('Item not found in invoice');
    }

    item.updateDescription(description);
    item.updateQuantity(quantity);
    item.updateUnitPrice(unitPrice);

    invoice.calculateTotals();
    return this.invoiceRepository.update(invoice);
  }

  async updateInvoiceStatus(
    invoiceId: string,
    status: InvoiceStatus
  ): Promise<InvoiceEntity> {
    const invoice = await this.invoiceRepository.findById(invoiceId);
    if (!invoice) {
      throw new Error('Invoice not found');
    }

    if (status === 'completed' && !invoice.canBeCompleted) {
      throw new Error(
        'Cannot complete invoice: missing required items or invalid data'
      );
    }

    invoice.status = status;
    if (status === 'completed') {
      invoice.markAsCompleted();
    } else if (status === 'pending') {
      invoice.markAsPending();
    }

    return this.invoiceRepository.update(invoice);
  }

  async setInvoiceClient(
    invoiceId: string,
    client?: ClientEntity
  ): Promise<InvoiceEntity> {
    const invoice = await this.invoiceRepository.findById(invoiceId);
    if (!invoice) {
      throw new Error('Invoice not found');
    }

    invoice.setClient(client);
    return this.invoiceRepository.update(invoice);
  }

  async getRecentInvoices(limit: number = 10): Promise<InvoiceEntity[]> {
    return this.invoiceRepository.findRecent(limit);
  }

  async getInvoice(id: string): Promise<InvoiceEntity | null> {
    return this.invoiceRepository.findById(id);
  }

  async getAllInvoices(): Promise<InvoiceEntity[]> {
    return this.invoiceRepository.findAll();
  }
}
