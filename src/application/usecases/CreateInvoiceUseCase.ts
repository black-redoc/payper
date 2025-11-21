import { InvoiceService } from '@/domain/services/InvoiceService';
import { CompanyService } from '@/domain/services/CompanyService';
import { ClientEntity } from '@/domain/entities/Client';
import { InvoiceEntity } from '@/domain/entities/Invoice';

export class CreateInvoiceUseCase {
  constructor(
    private invoiceService: InvoiceService,
    private companyService: CompanyService
  ) {}

  async execute(client?: ClientEntity): Promise<InvoiceEntity> {
    const hasCompanyData = await this.companyService.hasCompanyData();
    if (!hasCompanyData) {
      throw new Error('Company information is required to create invoices. Please set up company data first.');
    }

    return this.invoiceService.createInvoice(client);
  }
}