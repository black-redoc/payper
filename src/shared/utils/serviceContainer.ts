import { InvoiceService } from '@/domain/services/InvoiceService';
import { CompanyService } from '@/domain/services/CompanyService';
import { NoteService } from '@/domain/services/NoteService';
import { PrismaInvoiceRepository } from '@/infrastructure/repositories/PrismaInvoiceRepository';
import { PrismaCompanyRepository } from '@/infrastructure/repositories/PrismaCompanyRepository';
import { PrismaNoteRepository } from '@/infrastructure/repositories/PrismaNoteRepository';

class ServiceContainer {
  private static instance: ServiceContainer;

  private _invoiceRepository?: PrismaInvoiceRepository;
  private _companyRepository?: PrismaCompanyRepository;
  private _noteRepository?: PrismaNoteRepository;
  private _invoiceService?: InvoiceService;
  private _companyService?: CompanyService;
  private _noteService?: NoteService;

  static getInstance(): ServiceContainer {
    if (!ServiceContainer.instance) {
      ServiceContainer.instance = new ServiceContainer();
    }
    return ServiceContainer.instance;
  }

  get invoiceRepository(): PrismaInvoiceRepository {
    if (!this._invoiceRepository) {
      this._invoiceRepository = new PrismaInvoiceRepository();
    }
    return this._invoiceRepository;
  }

  get companyRepository(): PrismaCompanyRepository {
    if (!this._companyRepository) {
      this._companyRepository = new PrismaCompanyRepository();
    }
    return this._companyRepository;
  }

  get noteRepository(): PrismaNoteRepository {
    if (!this._noteRepository) {
      this._noteRepository = new PrismaNoteRepository();
    }
    return this._noteRepository;
  }

  get invoiceService(): InvoiceService {
    if (!this._invoiceService) {
      this._invoiceService = new InvoiceService(
        this.invoiceRepository,
        this.companyRepository
      );
    }
    return this._invoiceService;
  }

  get companyService(): CompanyService {
    if (!this._companyService) {
      this._companyService = new CompanyService(this.companyRepository);
    }
    return this._companyService;
  }

  get noteService(): NoteService {
    if (!this._noteService) {
      this._noteService = new NoteService(
        this.noteRepository,
        this.invoiceRepository
      );
    }
    return this._noteService;
  }
}

export const serviceContainer = ServiceContainer.getInstance();
