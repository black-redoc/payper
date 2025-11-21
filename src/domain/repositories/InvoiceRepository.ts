import { InvoiceEntity } from '../entities/Invoice';

export interface InvoiceRepository {
  save(invoice: InvoiceEntity): Promise<InvoiceEntity>;
  findById(id: string): Promise<InvoiceEntity | null>;
  findAll(): Promise<InvoiceEntity[]>;
  findRecent(limit?: number): Promise<InvoiceEntity[]>;
  update(invoice: InvoiceEntity): Promise<InvoiceEntity>;
  delete(id: string): Promise<void>;
}