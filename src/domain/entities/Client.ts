import { BaseEntity, IdentificationType } from '@/shared/types';

export interface Client extends BaseEntity {
  firstName?: string;
  lastName?: string;
  email?: string;
  identificationType?: IdentificationType;
  identificationNumber?: string;
}

export class ClientEntity implements Client {
  constructor(
    public id: string,
    public createdAt: Date,
    public updatedAt: Date,
    public firstName?: string,
    public lastName?: string,
    public email?: string,
    public identificationType?: IdentificationType,
    public identificationNumber?: string
  ) {}

  get fullName(): string {
    if (!this.firstName && !this.lastName) return '';
    return `${this.firstName || ''} ${this.lastName || ''}`.trim();
  }

  get isComplete(): boolean {
    return !!(this.firstName || this.lastName || this.identificationNumber);
  }

  static create(data: Partial<Client>): ClientEntity {
    const now = new Date();
    return new ClientEntity(
      data.id || crypto.randomUUID(),
      data.createdAt || now,
      data.updatedAt || now,
      data.firstName,
      data.lastName,
      data.email,
      data.identificationType,
      data.identificationNumber
    );
  }
}