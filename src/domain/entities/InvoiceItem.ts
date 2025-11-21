import { BaseEntity, Money } from '@/shared/types';

export interface InvoiceItem extends BaseEntity {
  description: string;
  quantity: number;
  unitPrice: Money;
  total: Money;
}

export class InvoiceItemEntity implements InvoiceItem {
  constructor(
    public id: string,
    public createdAt: Date,
    public updatedAt: Date,
    public description: string,
    public quantity: number,
    public unitPrice: Money,
    public total: Money
  ) {}

  calculateTotal(): void {
    this.total = {
      amount: this.quantity * this.unitPrice.amount,
      currency: this.unitPrice.currency
    };
    this.updatedAt = new Date();
  }

  updateQuantity(newQuantity: number): void {
    this.quantity = Math.max(0, newQuantity);
    this.calculateTotal();
  }

  updateUnitPrice(newPrice: Money): void {
    this.unitPrice = newPrice;
    this.calculateTotal();
  }

  updateDescription(newDescription: string): void {
    this.description = newDescription.trim();
    this.updatedAt = new Date();
  }

  get isValid(): boolean {
    return !!(
      this.description.trim() &&
      this.quantity > 0 &&
      this.unitPrice.amount > 0
    );
  }

  static create(data: {
    description: string;
    quantity: number;
    unitPrice: Money;
    id?: string;
    createdAt?: Date;
    updatedAt?: Date;
  }): InvoiceItemEntity {
    const now = new Date();
    const item = new InvoiceItemEntity(
      data.id || crypto.randomUUID(),
      data.createdAt || now,
      data.updatedAt || now,
      data.description,
      data.quantity,
      data.unitPrice,
      { amount: 0, currency: data.unitPrice.currency }
    );
    item.calculateTotal();
    return item;
  }
}