import { InvoiceService } from '@/domain/services/InvoiceService';
import { CompanyService } from '@/domain/services/CompanyService';
import { NoteService } from '@/domain/services/NoteService';
import { LocalStorageInvoiceRepository } from '@/infrastructure/repositories/LocalStorageInvoiceRepository';
import { LocalStorageCompanyRepository } from '@/infrastructure/repositories/LocalStorageCompanyRepository';
import { LocalStorageNoteRepository } from '@/infrastructure/repositories/LocalStorageNoteRepository';

class ServiceContainer {
  private static instance: ServiceContainer;

  private _invoiceRepository?: LocalStorageInvoiceRepository;
  private _companyRepository?: LocalStorageCompanyRepository;
  private _noteRepository?: LocalStorageNoteRepository;
  private _invoiceService?: InvoiceService;
  private _companyService?: CompanyService;
  private _noteService?: NoteService;

  static getInstance(): ServiceContainer {
    if (!ServiceContainer.instance) {
      ServiceContainer.instance = new ServiceContainer();
    }
    return ServiceContainer.instance;
  }

  get invoiceRepository(): LocalStorageInvoiceRepository {
    if (!this._invoiceRepository) {
      this._invoiceRepository = new LocalStorageInvoiceRepository();
    }
    return this._invoiceRepository;
  }

  get companyRepository(): LocalStorageCompanyRepository {
    if (!this._companyRepository) {
      this._companyRepository = new LocalStorageCompanyRepository();
    }
    return this._companyRepository;
  }

  get noteRepository(): LocalStorageNoteRepository {
    if (!this._noteRepository) {
      this._noteRepository = new LocalStorageNoteRepository();
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