import { BaseEntity, Money } from '@/shared/types';
import { ClientEntity } from './Client';
import { CompanyEntity } from './Company';
import { InvoiceItemEntity } from './InvoiceItem';

export type InvoiceStatus = 'draft' | 'pending' | 'completed';

export interface Invoice extends BaseEntity {
  number: string;
  status: InvoiceStatus;
  company: CompanyEntity;
  client?: ClientEntity;
  items: InvoiceItemEntity[];
  subtotal: Money;
  tipAmount: Money;
  total: Money;
  notes?: string;
  dueDate?: Date;
}

export class InvoiceEntity implements Invoice {
  constructor(
    public id: string,
    public createdAt: Date,
    public updatedAt: Date,
    public number: string,
    public status: InvoiceStatus,
    public company: CompanyEntity,
    public items: InvoiceItemEntity[] = [],
    public subtotal: Money = { amount: 0, currency: 'COP' },
    public tipAmount: Money = { amount: 0, currency: 'COP' },
    public total: Money = { amount: 0, currency: 'COP' },
    public client?: ClientEntity,
    public notes?: string,
    public dueDate?: Date
  ) {}

  addItem(item: InvoiceItemEntity): void {
    this.items.push(item);
    this.calculateTotals();
  }

  removeItem(itemId: string): void {
    this.items = this.items.filter(item => item.id !== itemId);
    this.calculateTotals();
  }

  updateItem(itemId: string, updates: Partial<InvoiceItemEntity>): void {
    const itemIndex = this.items.findIndex(item => item.id === itemId);
    if (itemIndex !== -1) {
      const item = this.items[itemIndex];
      Object.assign(item, updates);
      item.calculateTotal();
      this.calculateTotals();
    }
  }

  setClient(client?: ClientEntity): void {
    this.client = client;
    this.updatedAt = new Date();
  }

  calculateTotals(): void {
    this.subtotal = this.items.reduce(
      (acc, item) => ({
        amount: acc.amount + item.total.amount,
        currency: acc.currency
      }),
      { amount: 0, currency: 'COP' }
    );

    if (this.company.tipEnabled) {
      this.tipAmount = {
        amount: (this.subtotal.amount * this.company.tipPercentage) / 100,
        currency: this.subtotal.currency
      };
    } else {
      this.tipAmount = { amount: 0, currency: this.subtotal.currency };
    }

    this.total = {
      amount: this.subtotal.amount + this.tipAmount.amount,
      currency: this.subtotal.currency
    };

    this.updatedAt = new Date();
  }

  markAsCompleted(): void {
    this.status = 'completed';
    this.updatedAt = new Date();
  }

  markAsPending(): void {
    this.status = 'pending';
    this.updatedAt = new Date();
  }

  get canBeCompleted(): boolean {
    return this.items.length > 0 && this.items.every(item => item.isValid);
  }

  get hasValidItems(): boolean {
    return this.items.length > 0;
  }

  static create(data: {
    company: CompanyEntity;
    number?: string;
    client?: ClientEntity;
    items?: InvoiceItemEntity[];
    notes?: string;
    dueDate?: Date;
  }): InvoiceEntity {
    const now = new Date();
    const invoice = new InvoiceEntity(
      crypto.randomUUID(),
      now,
      now,
      data.number || InvoiceEntity.generateNumber(),
      'draft',
      data.company,
      data.items || [],
      { amount: 0, currency: 'COP' },
      { amount: 0, currency: 'COP' },
      { amount: 0, currency: 'COP' },
      data.client,
      data.notes,
      data.dueDate
    );
    invoice.calculateTotals();
    return invoice;
  }

  private static generateNumber(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const time = String(now.getTime()).slice(-6);
    return `INV-${year}${month}${day}-${time}`;
  }
}