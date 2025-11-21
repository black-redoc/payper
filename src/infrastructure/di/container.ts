// Dependency Injection Container
import { PrismaInvoiceRepository } from '../repositories/PrismaInvoiceRepository';
import { PrismaNoteRepository } from '../repositories/PrismaNoteRepository';
import { PrismaCompanyRepository } from '../repositories/PrismaCompanyRepository';
import { LocalStorageInvoiceRepository } from '../repositories/LocalStorageInvoiceRepository';
import { LocalStorageNoteRepository } from '../repositories/LocalStorageNoteRepository';
import { LocalStorageCompanyRepository } from '../repositories/LocalStorageCompanyRepository';
import { InvoiceRepository } from '@/domain/repositories/InvoiceRepository';
import { NoteRepository } from '@/domain/repositories/NoteRepository';
import { CompanyRepository } from '@/domain/repositories/CompanyRepository';
import { InvoiceService } from '@/domain/services/InvoiceService';
import { NoteService } from '@/domain/services/NoteService';
import { CompanyService } from '@/domain/services/CompanyService';

// Determinar si estamos en desarrollo
const isDev = process.env.ENV === 'DEV';

// Repositorios
export const invoiceRepository: InvoiceRepository = isDev
  ? new PrismaInvoiceRepository()
  : new LocalStorageInvoiceRepository();

export const noteRepository: NoteRepository = isDev
  ? new PrismaNoteRepository()
  : new LocalStorageNoteRepository();

export const companyRepository: CompanyRepository = isDev
  ? new PrismaCompanyRepository()
  : new LocalStorageCompanyRepository();

// Servicios
export const invoiceService = new InvoiceService(invoiceRepository, companyRepository);
export const noteService = new NoteService(noteRepository, invoiceRepository);
export const companyService = new CompanyService(companyRepository);
