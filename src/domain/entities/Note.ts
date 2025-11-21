import { BaseEntity, Money, NoteType, NoteReason } from '@/shared/types';
import { InvoiceItemEntity } from './InvoiceItem';

export interface Note extends BaseEntity {
  number: string;
  type: NoteType;
  invoiceId: string;
  reason: NoteReason;
  reasonDescription: string;
  items: InvoiceItemEntity[];
  subtotal: Money;
  total: Money;
}

export class NoteEntity implements Note {
  constructor(
    public id: string,
    public createdAt: Date,
    public updatedAt: Date,
    public number: string,
    public type: NoteType,
    public invoiceId: string,
    public reason: NoteReason,
    public reasonDescription: string,
    public items: InvoiceItemEntity[] = [],
    public subtotal: Money = { amount: 0, currency: 'COP' },
    public total: Money = { amount: 0, currency: 'COP' }
  ) {}

  addItem(item: InvoiceItemEntity): void {
    this.items.push(item);
    this.calculateTotals();
  }

  removeItem(itemId: string): void {
    this.items = this.items.filter(item => item.id !== itemId);
    this.calculateTotals();
  }

  calculateTotals(): void {
    this.subtotal = this.items.reduce(
      (acc, item) => ({
        amount: acc.amount + item.total.amount,
        currency: acc.currency
      }),
      { amount: 0, currency: 'COP' }
    );

    this.total = { ...this.subtotal };
    this.updatedAt = new Date();
  }

  get hasValidItems(): boolean {
    return this.items.length > 0;
  }

  get canBeCompleted(): boolean {
    return this.items.length > 0 && this.items.every(item => item.isValid);
  }

  static create(data: {
    type: NoteType;
    invoiceId: string;
    reason: NoteReason;
    reasonDescription: string;
    number?: string;
    items?: InvoiceItemEntity[];
  }): NoteEntity {
    const now = new Date();
    const note = new NoteEntity(
      crypto.randomUUID(),
      now,
      now,
      data.number || NoteEntity.generateNumber(data.type),
      data.type,
      data.invoiceId,
      data.reason,
      data.reasonDescription,
      data.items || [],
      { amount: 0, currency: 'COP' },
      { amount: 0, currency: 'COP' }
    );
    note.calculateTotals();
    return note;
  }

  private static generateNumber(type: NoteType): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const time = String(now.getTime()).slice(-6);
    const prefix = type === 'credit' ? 'NC' : 'ND';
    return `${prefix}-${year}${month}${day}-${time}`;
  }
}
